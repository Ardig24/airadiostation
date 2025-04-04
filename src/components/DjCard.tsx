import React from 'react';
import { Bot, MessageSquare, Music } from 'lucide-react';
import { VoiceProfile } from '../types';

interface DjCardProps {
  currentVoiceProfile: VoiceProfile | null;
  isDjSpeaking: boolean;
  isChatResponse: boolean;
}

const AudioWaves = () => (
  <div className="flex gap-1 items-end h-12">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-emerald-400/60 rounded-full animate-pulse"
        style={{
          height: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

const DjCard: React.FC<DjCardProps> = ({
  currentVoiceProfile,
  isDjSpeaking,
  isChatResponse
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transform hover:scale-105 transition-transform">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className={`absolute -inset-4 rounded-full ${isDjSpeaking ? (isChatResponse ? 'bg-blue-500/20 animate-pulse' : 'bg-emerald-500/20 animate-pulse') : 'bg-white/10'}`} />
          <Bot className="w-24 h-24 text-emerald-400" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white text-center mb-4">
        {currentVoiceProfile?.name || 'DJ ByteBeat'}
      </h2>
      <p className="text-gray-300 text-center">
        {isDjSpeaking 
          ? (isChatResponse 
              ? 'Responding to your message...'
              : 'Introducing the next track...')
          : currentVoiceProfile?.personality || 'Your AI host spinning the perfect tracks based on real-time mood analysis and crowd preferences.'}
      </p>
      
      {/* Audio Waves Animation when DJ is speaking */}
      {isDjSpeaking && (
        <div className="mt-6 flex justify-center items-center gap-2">
          {isChatResponse && <MessageSquare className="text-blue-400 w-5 h-5" />}
          {!isChatResponse && <Music className="text-emerald-400 w-5 h-5" />}
          <AudioWaves />
        </div>
      )}
    </div>
  );
};

export default DjCard;
