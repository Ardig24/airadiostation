import React from 'react';

interface AudioWavesProps {
  height?: number;
  count?: number;
  color?: string;
}

const AudioWaves: React.FC<AudioWavesProps> = ({
  height = 12,
  count = 20,
  color = 'bg-emerald-400/60'
}) => (
  <div className={`flex gap-1 items-end h-${height}`}>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className={`w-1 ${color} rounded-full animate-pulse`}
        style={{
          height: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

export default AudioWaves;
