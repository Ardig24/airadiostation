import React from 'react';
import { Disc } from 'lucide-react';
import { Track } from '../types';

interface QueuePreviewProps {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  maxItems?: number;
}

const QueuePreview: React.FC<QueuePreviewProps> = ({
  queue,
  currentTrack,
  isPlaying,
  maxItems = 6
}) => {
  if (queue.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Coming Up Next</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.slice(0, maxItems).map((track, index) => (
          <div 
            key={track.id} 
            className={`p-4 rounded-xl ${index === 0 && currentTrack?.id === track.id ? 'bg-emerald-400/20 border border-emerald-400/50' : 'bg-white/5 border border-white/10'} transition-all hover:translate-x-1`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white">
                {index === 0 && isPlaying ? (
                  <div className="animate-pulse">
                    <Disc size={20} className="text-emerald-400" />
                  </div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="text-white font-medium truncate">{track.title}</div>
                <div className="text-emerald-400 text-sm truncate">{track.artist}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueuePreview;
