import React from 'react';
import { Music, MessageSquare, Radio, Mic, Clock } from 'lucide-react';
import { ContentItem } from '../types';

interface ContentDisplayProps {
  contentItems: ContentItem[];
  maxItems?: number;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
  contentItems, 
  maxItems = 5 
}) => {
  if (contentItems.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 h-full flex items-center justify-center">
        <div className="text-center text-white/60">
          <Radio size={40} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No content to display yet</p>
          <p className="text-sm">Content will appear here as the AI DJ plays tracks and makes announcements</p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Radio className="text-emerald-400" size={20} />;
      case 'track':
        return <Music className="text-purple-400" size={20} />;
      case 'message':
        return <MessageSquare className="text-blue-400" size={20} />;
      default:
        return <Mic className="text-yellow-400" size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'DJ Announcement';
      case 'track':
        return 'Track Info';
      case 'message':
        return 'Listener Message';
      default:
        return 'Content';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'border-emerald-400/30 bg-emerald-400/10';
      case 'track':
        return 'border-purple-400/30 bg-purple-400/10';
      case 'message':
        return 'border-blue-400/30 bg-blue-400/10';
      default:
        return 'border-yellow-400/30 bg-yellow-400/10';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 overflow-hidden h-[400px] flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4 flex justify-between items-center">
        <span>Recent Activity</span>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Clock size={14} />
          <span>Live Feed</span>
        </div>
      </h2>
      <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
        {contentItems.slice(0, maxItems).map((item, index) => (
          <div 
            key={item.id} 
            className={`${getTypeColor(item.type)} border rounded-xl p-4 animate-fadeIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getIcon(item.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-white/70">{getTypeLabel(item.type)}</span>
                  <span className="text-xs text-white/50">{formatTime(item.timestamp)}</span>
                </div>
                {item.type === 'track' && item.title && (
                  <div className="font-medium text-white mb-1">
                    {item.title} {item.artist && <span className="text-white/70">by {item.artist}</span>}
                  </div>
                )}
                <div className="text-white/90 text-sm">{item.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ContentDisplay;
