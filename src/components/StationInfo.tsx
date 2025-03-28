import React from 'react';
import { Bot, Music, Users, Radio } from 'lucide-react';
import { Playlist, VoiceProfile } from '../types';

interface StationInfoProps {
  listenerCount: number;
  queueLength: number;
  currentVoiceProfile: VoiceProfile | null;
  currentPlaylist: Playlist | null;
}

const StationInfo: React.FC<StationInfoProps> = ({
  listenerCount,
  queueLength,
  currentVoiceProfile,
  currentPlaylist
}) => {
  const stats = [
    { 
      label: 'Listeners', 
      value: listenerCount.toString() || '0', 
      icon: <Users size={20} /> 
    },
    { 
      label: 'Tracks in Queue', 
      value: queueLength.toString() || '0', 
      icon: <Music size={20} /> 
    },
    { 
      label: 'Current DJ', 
      value: currentVoiceProfile?.name || 'DJ ByteBeat', 
      icon: <Bot size={20} /> 
    },
    { 
      label: 'Station', 
      value: currentPlaylist?.name || 'AI Radio', 
      icon: <Radio size={20} /> 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20 transition-transform hover:scale-105"
        >
          <div className="flex justify-center text-emerald-400 mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-white truncate">{stat.value}</div>
          <div className="text-emerald-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StationInfo;
