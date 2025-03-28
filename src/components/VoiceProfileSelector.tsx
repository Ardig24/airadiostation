import React from 'react';
import { Bot } from 'lucide-react';
import { VoiceProfile } from '../services/supabaseService';

interface VoiceProfileSelectorProps {
  profiles: VoiceProfile[];
  selectedProfileId: string | null;
  onSelect: (profile: VoiceProfile) => void;
  isLoading?: boolean;
}

const VoiceProfileSelector: React.FC<VoiceProfileSelectorProps> = ({
  profiles,
  selectedProfileId,
  onSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-medium text-white mb-4">Loading AI DJs...</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-medium text-white mb-2">No AI DJs Available</h3>
        <p className="text-gray-300 text-sm">Try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-medium text-white mb-4">Select AI DJ</h3>
      <div className="space-y-3">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelect(profile)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selectedProfileId === profile.id
              ? 'bg-emerald-400/20 border border-emerald-400/50'
              : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedProfileId === profile.id ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
              <Bot className={`w-5 h-5 ${selectedProfileId === profile.id ? 'text-emerald-400' : 'text-white'}`} />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">{profile.name}</div>
              <div className={`text-sm ${selectedProfileId === profile.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                {profile.personality}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceProfileSelector;
