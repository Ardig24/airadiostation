import React, { useState } from 'react';
import { MessageSquare, Music, Send, Mic, Sparkles } from 'lucide-react';
import { useRadioStore } from '../store/radioStore';

const UserInteraction: React.FC = () => {
  const { addUserMessage } = useRadioStore();
  const [message, setMessage] = useState('');
  const [songRequest, setSongRequest] = useState({ title: '', artist: '' });
  const [activeTab, setActiveTab] = useState<'chat' | 'request'>('chat');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setIsSubmitting(true);
      try {
        await addUserMessage(message, 'message');
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRequestSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (songRequest.title.trim()) {
      setIsSubmitting(true);
      try {
        const requestMessage = songRequest.artist 
          ? `Please play "${songRequest.title}" by ${songRequest.artist}` 
          : `Please play "${songRequest.title}"`;
        
        await addUserMessage(requestMessage, 'request');
        setSongRequest({ title: '', artist: '' });
      } catch (error) {
        console.error('Error requesting song:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVoiceInput = () => {
    // This would integrate with the Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      alert('Voice input feature coming soon!');
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
      <div className="flex border-b border-white/10 mb-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'chat' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white'}`}
        >
          <MessageSquare size={18} />
          Chat with DJ
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'request' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white'}`}
        >
          <Music size={18} />
          Request Song
        </button>
      </div>

      {activeTab === 'chat' ? (
        <form onSubmit={handleSubmitMessage}>
          <div className="mb-4">
            <label htmlFor="message" className="block text-white text-sm mb-2">
              Send a message to the AI DJ
            </label>
            <div className="relative">
              <input
                id="message"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something or ask a question..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-24"
                disabled={isSubmitting}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="p-1.5 text-white/70 hover:text-emerald-400 transition-colors"
                >
                  <Mic size={18} />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-white/70 hover:text-emerald-400 transition-colors"
                  title="AI Suggestions"
                >
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Message
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRequestSong}>
          <div className="mb-4">
            <label htmlFor="songTitle" className="block text-white text-sm mb-2">
              Song Title*
            </label>
            <input
              id="songTitle"
              type="text"
              value={songRequest.title}
              onChange={(e) => setSongRequest({ ...songRequest, title: e.target.value })}
              placeholder="Enter song title"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="artist" className="block text-white text-sm mb-2">
              Artist (optional)
            </label>
            <input
              id="artist"
              type="text"
              value={songRequest.artist}
              onChange={(e) => setSongRequest({ ...songRequest, artist: e.target.value })}
              placeholder="Enter artist name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={!songRequest.title.trim() || isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Music size={16} />
                Request Song
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserInteraction;
