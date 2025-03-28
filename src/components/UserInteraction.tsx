import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { useRadioStore } from '../store/radioStore';

const UserInteraction: React.FC = () => {
  const { addUserMessage } = useRadioStore();
  const [songRequest, setSongRequest] = useState({ title: '', artist: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (songRequest.title.trim()) {
      setIsSubmitting(true);
      try {
        const requestMessage = songRequest.artist 
          ? `Please play "${songRequest.title}" by ${songRequest.artist}` 
          : `Please play "${songRequest.title}"`;
        
        await addUserMessage(requestMessage);
        setSongRequest({ title: '', artist: '' });
      } catch (error) {
        console.error('Error requesting song:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
        <Music size={18} className="text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Request a Song</h3>
      </div>

      <form onSubmit={handleRequestSong}>
        <div className="mb-4">
          <label htmlFor="songTitle" className="block text-white text-sm mb-2">
            Song Title
          </label>
          <input
            id="songTitle"
            type="text"
            value={songRequest.title}
            onChange={(e) => setSongRequest({ ...songRequest, title: e.target.value })}
            placeholder="Enter song title..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="songArtist" className="block text-white text-sm mb-2">
            Artist (optional)
          </label>
          <input
            id="songArtist"
            type="text"
            value={songRequest.artist}
            onChange={(e) => setSongRequest({ ...songRequest, artist: e.target.value })}
            placeholder="Enter artist name..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            disabled={isSubmitting || !songRequest.title.trim()}
          >
            <Music size={16} />
            Request Song
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInteraction;
