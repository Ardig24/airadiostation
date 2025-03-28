# ElevenLabs Integration Guide for AI Radio Station

## Overview

This guide outlines how to integrate ElevenLabs voice synthesis into the AI Radio Station project. ElevenLabs provides high-quality, natural-sounding AI voices that will power your AI DJs and hosts.

## 1. Setting Up ElevenLabs

### Create an Account

1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Choose a subscription plan (for hackathon purposes, the free tier may be sufficient, but consider a paid plan for better quality and higher limits)
3. Generate an API key from your profile settings

## 2. Voice Selection

### Explore Available Voices

1. Browse the ElevenLabs voice library to find voices that match your radio station's personality
2. For a diverse radio station, select multiple voices for different roles:
   - Primary DJ (engaging, energetic)
   - News anchor (professional, clear)
   - Weather reporter (friendly, informative)
   - Night host (calm, soothing)

### Clone and Customize Voices

For a truly unique radio station:
1. Consider cloning voices and customizing them
2. Adjust settings like clarity, stability, and style to match your brand

## 3. Frontend Integration

### Install the SDK

```bash
npm install @elevenlabs/browser-sdk
```

### Create a Voice Service

```typescript
// src/services/voiceService.ts
import { Audio, VoiceStream } from '@elevenlabs/browser-sdk';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

type VoiceOptions = {
  voiceId: string;
  text: string;
  stability?: number;
  clarity?: number;
  style?: number;
};

export class VoiceService {
  private static instance: VoiceService;
  private audioElement: HTMLAudioElement | null = null;
  private currentStream: VoiceStream | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
    }
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public async generateSpeech(options: VoiceOptions): Promise<Blob> {
    const { voiceId, text, stability = 0.5, clarity = 0.75, style = 0.5 } = options;
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability,
          similarity_boost: clarity,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ElevenLabs API error: ${error.message || response.statusText}`);
    }

    return await response.blob();
  }

  public async streamSpeech(options: VoiceOptions): Promise<void> {
    const { voiceId, text, stability = 0.5, clarity = 0.75, style = 0.5 } = options;
    
    // Stop any current stream
    this.stopStream();
    
    this.currentStream = new VoiceStream({
      apiKey: ELEVENLABS_API_KEY,
      voiceId,
      textChunk: text,
      modelId: 'eleven_turbo_v2',
      stability,
      similarityBoost: clarity,
      style,
      useSpeakerBoost: true,
      onDataStart: () => {
        console.log('Speech streaming started');
      },
      onDataEnd: () => {
        console.log('Speech streaming ended');
      },
      onError: (error) => {
        console.error('Speech streaming error:', error);
      },
    });

    await this.currentStream.start();
    return;
  }

  public stopStream(): void {
    if (this.currentStream) {
      this.currentStream.stop();
      this.currentStream = null;
    }
  }

  public async playAudioBlob(blob: Blob): Promise<void> {
    if (!this.audioElement) return;
    
    const url = URL.createObjectURL(blob);
    this.audioElement.src = url;
    
    try {
      await this.audioElement.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    } finally {
      // Clean up the URL object after playback
      this.audioElement.onended = () => URL.revokeObjectURL(url);
    }
  }
}

export const voiceService = VoiceService.getInstance();
```

## 4. Voice Profile Management

### Create a Voice Profile Component

```typescript
// src/components/VoiceProfileSelector.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface VoiceProfile {
  id: string;
  name: string;
  elevenlabs_voice_id: string;
  personality: string;
  speaking_style: string;
  is_active: boolean;
}

interface VoiceProfileSelectorProps {
  onSelect: (profile: VoiceProfile) => void;
  selectedId?: string;
}

export const VoiceProfileSelector: React.FC<VoiceProfileSelectorProps> = ({ 
  onSelect, 
  selectedId 
}) => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVoiceProfiles() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('voice_profiles')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        setProfiles(data || []);

        // Auto-select first profile if none selected
        if (data && data.length > 0 && !selectedId) {
          onSelect(data[0]);
        }
      } catch (err) {
        setError('Failed to load voice profiles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadVoiceProfiles();
  }, [onSelect, selectedId]);

  if (loading) return <div>Loading voice profiles...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Select AI DJ Voice</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className={`p-3 rounded-lg border transition-all ${selectedId === profile.id
              ? 'bg-emerald-400/20 border-emerald-400'
              : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            onClick={() => onSelect(profile)}
          >
            <div className="text-white font-medium">{profile.name}</div>
            <div className="text-emerald-400 text-sm">{profile.personality}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

## 5. DJ Script Generation and Voice Synthesis

### Create a Radio DJ Service

```typescript
// src/services/radioDjService.ts
import { voiceService } from './voiceService';
import { supabase } from './supabase';

interface VoiceProfile {
  id: string;
  name: string;
  elevenlabs_voice_id: string;
  personality: string;
  speaking_style: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string[];
}

export class RadioDjService {
  private currentVoiceProfile: VoiceProfile | null = null;

  constructor() {}

  public setVoiceProfile(profile: VoiceProfile): void {
    this.currentVoiceProfile = profile;
  }

  public async announceTrack(track: Track): Promise<void> {
    if (!this.currentVoiceProfile) {
      throw new Error('No voice profile selected');
    }

    // Generate announcement text
    const announcementText = this.generateTrackAnnouncementText(track);
    
    // Save to content database for history
    await this.saveContent('track_announcement', announcementText);
    
    // Generate and play speech
    await voiceService.streamSpeech({
      voiceId: this.currentVoiceProfile.elevenlabs_voice_id,
      text: announcementText,
    });
  }

  public async announceNews(newsTitle: string, newsSummary: string): Promise<void> {
    if (!this.currentVoiceProfile) {
      throw new Error('No voice profile selected');
    }

    // Generate news announcement
    const newsText = `Here's the latest news: ${newsTitle}. ${newsSummary}`;
    
    // Save to content database
    await this.saveContent('news', newsText);
    
    // Generate and play speech
    await voiceService.streamSpeech({
      voiceId: this.currentVoiceProfile.elevenlabs_voice_id,
      text: newsText,
      // News should be more clear and stable
      stability: 0.7,
      clarity: 0.9,
    });
  }

  public async makeCustomAnnouncement(text: string, type: string = 'custom'): Promise<void> {
    if (!this.currentVoiceProfile) {
      throw new Error('No voice profile selected');
    }
    
    // Save to content database
    await this.saveContent(type, text);
    
    // Generate and play speech
    await voiceService.streamSpeech({
      voiceId: this.currentVoiceProfile.elevenlabs_voice_id,
      text,
    });
  }

  private generateTrackAnnouncementText(track: Track): string {
    // Array of possible announcement templates
    const templates = [
      `Now playing: ${track.title} by ${track.artist}.`,
      `Up next, we have ${track.title} from ${track.artist}.`,
      `Let's continue with ${track.artist} and their track ${track.title}.`,
      `This is ${track.title} by ${track.artist}. Enjoy!`,
      `You're listening to ${track.title} by ${track.artist} on AI Radio.`
    ];
    
    // Randomly select a template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template;
  }

  private async saveContent(type: string, body: string): Promise<void> {
    try {
      await supabase.from('content').insert({
        type,
        title: type.replace('_', ' '),
        body,
        is_played: true,
        scheduled_for: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving content to database:', error);
    }
  }
}

export const radioDjService = new RadioDjService();
```

## 6. Optimizing Voice Synthesis for Radio

### Caching Common Phrases

To reduce API calls and improve performance:

1. Pre-generate common DJ phrases (intros, transitions, time announcements)
2. Store the audio files in Supabase storage
3. Create a cache service to manage these audio clips

### Voice Continuity

For a seamless listening experience:

1. Use consistent voice profiles for specific segments
2. Maintain consistent speaking styles within segments
3. Add appropriate pauses between segments

## 7. Voice Mixing with Music

### Audio Mixing Service

```typescript
// src/services/audioMixingService.ts
export class AudioMixingService {
  private musicGainNode: GainNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private audioContext: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }
  
  private initAudioContext() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.musicGainNode = this.audioContext.createGain();
    this.voiceGainNode = this.audioContext.createGain();
    
    // Connect gain nodes to output
    this.musicGainNode.connect(this.audioContext.destination);
    this.voiceGainNode.connect(this.audioContext.destination);
    
    // Set initial levels
    this.musicGainNode.gain.value = 1.0;
    this.voiceGainNode.gain.value = 1.0;
  }
  
  public async playMusicWithVoiceOver(musicUrl: string, voiceBlob: Blob): Promise<void> {
    if (!this.audioContext || !this.musicGainNode || !this.voiceGainNode) {
      throw new Error('Audio context not initialized');
    }
    
    // Load music file
    const musicResponse = await fetch(musicUrl);
    const musicArrayBuffer = await musicResponse.arrayBuffer();
    const musicBuffer = await this.audioContext.decodeAudioData(musicArrayBuffer);
    
    // Load voice file
    const voiceArrayBuffer = await voiceBlob.arrayBuffer();
    const voiceBuffer = await this.audioContext.decodeAudioData(voiceArrayBuffer);
    
    // Create audio sources
    const musicSource = this.audioContext.createBufferSource();
    const voiceSource = this.audioContext.createBufferSource();
    
    musicSource.buffer = musicBuffer;
    voiceSource.buffer = voiceBuffer;
    
    // Connect sources to gain nodes
    musicSource.connect(this.musicGainNode);
    voiceSource.connect(this.voiceGainNode);
    
    // Duck the music when voice is playing
    this.duckMusicForVoice(voiceBuffer.duration);
    
    // Start playback
    musicSource.start(0);
    voiceSource.start(0);
  }
  
  private duckMusicForVoice(voiceDuration: number) {
    if (!this.audioContext || !this.musicGainNode) return;
    
    const currentTime = this.audioContext.currentTime;
    
    // Gradually lower music volume
    this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, currentTime);
    this.musicGainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.5);
    
    // Hold at lower volume during voice
    this.musicGainNode.gain.setValueAtTime(0.2, currentTime + voiceDuration - 0.5);
    
    // Gradually restore music volume
    this.musicGainNode.gain.linearRampToValueAtTime(1.0, currentTime + voiceDuration + 0.5);
  }
}

export const audioMixingService = new AudioMixingService();
```

## 8. Testing Voice Quality

### Create a Voice Testing Tool

Develop a simple testing component to evaluate different voices and settings:

```typescript
// src/components/VoiceTester.tsx
import React, { useState } from 'react';
import { voiceService } from '../services/voiceService';
import { VoiceProfileSelector } from './VoiceProfileSelector';

interface VoiceProfile {
  id: string;
  name: string;
  elevenlabs_voice_id: string;
  personality: string;
  speaking_style: string;
}

export const VoiceTester: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
  const [testText, setTestText] = useState('Welcome to AI Radio Station! This is a test of our voice synthesis system.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stability, setStability] = useState(0.5);
  const [clarity, setClarity] = useState(0.75);
  const [style, setStyle] = useState(0.5);

  const handleTestVoice = async () => {
    if (!selectedProfile) return;
    
    try {
      setIsGenerating(true);
      await voiceService.streamSpeech({
        voiceId: selectedProfile.elevenlabs_voice_id,
        text: testText,
        stability,
        clarity,
        style
      });
    } catch (error) {
      console.error('Error testing voice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white">Voice Testing Tool</h2>
      
      <VoiceProfileSelector 
        onSelect={setSelectedProfile}
        selectedId={selectedProfile?.id}
      />
      
      <div>
        <label className="block text-white mb-2">Test Script</label>
        <textarea
          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
          rows={4}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-white mb-2">Stability: {stability}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={stability}
            onChange={(e) => setStability(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">Clarity: {clarity}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={clarity}
            onChange={(e) => setClarity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-white mb-2">Style: {style}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={style}
            onChange={(e) => setStyle(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <button
        onClick={handleTestVoice}
        disabled={isGenerating || !selectedProfile}
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : 'Test Voice'}
      </button>
    </div>
  );
};
```

## 9. Production Considerations

### API Usage Optimization

- Implement caching for frequently used phrases
- Batch process content generation during off-peak times
- Monitor API usage to stay within limits

### Cost Management

- The ElevenLabs API is billed based on characters processed
- Consider pre-generating common announcements
- Use streaming for live content and pre-generated audio for repeating segments

## 10. Next Steps

- Implement voice emotion detection to match music mood
- Create a voice profile management interface
- Develop a content scheduling system that optimizes API usage
- Experiment with different voices for different radio segments
