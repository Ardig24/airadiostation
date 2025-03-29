/**
 * Podcast Voice Service
 * 
 * Handles text-to-speech for podcast hosts with engaging, natural-sounding voices using ElevenLabs
 */

import { elevenlabsService } from '../lib/elevenlabs';

type SpeechCallback = () => void;

class PodcastVoiceService {
  private audioCache: Map<string, string> = new Map();
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private onSpeechEndCallback: SpeechCallback | null = null;
  
  // ElevenLabs voice IDs
  private hostVoices = {
    host1: 'pNInz6obpgDQGcFmaJgB', // Adam - energetic male voice
    host2: 'EXAVITQu4vr4xnSDxMaL'  // Rachel - thoughtful female voice
  };
  
  constructor() {
    // Create audio element for playback
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      
      // Set up event listeners
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
        // Call the callback if it exists
        if (this.onSpeechEndCallback) {
          this.onSpeechEndCallback();
          this.onSpeechEndCallback = null;
        }
      });
    }
  }
  
  /**
   * Pre-generate text-to-speech without playing it (for preparing next responses)
   */
  async textToSpeech(text: string, hostType: 'host1' | 'host2' = 'host1'): Promise<string> {
    try {
      console.log(`Pre-generating speech for ${hostType}:`, text);
      
      // Set the appropriate voice ID
      const voiceId = this.hostVoices[hostType];
      elevenlabsService.setVoice(voiceId);
      
      // Check if we already have this text in our cache
      const cacheKey = `${hostType}:${text}`;
      if (this.audioCache.has(cacheKey)) {
        return this.audioCache.get(cacheKey) || '';
      }
      
      // Generate speech with ElevenLabs but don't play it
      const audioUrl = await elevenlabsService.textToSpeech(text);
      
      if (audioUrl) {
        // Cache the result
        this.audioCache.set(cacheKey, audioUrl);
        return audioUrl;
      }
      
      return '';
    } catch (error) {
      console.error('Error pre-generating podcast host speech:', error);
      return '';
    }
  }
  
  /**
   * Speak text with a podcast host voice using ElevenLabs
   */
  async speakWithHostVoice(text: string, hostType: 'host1' | 'host2', onComplete?: SpeechCallback): Promise<string> {
    try {
      console.log(`Speaking with ${hostType} voice:`, text.substring(0, 50) + '...');
      console.log(`Using voice ID: ${this.hostVoices[hostType]}`);
      
      // Set the callback if provided
      if (onComplete) {
        this.onSpeechEndCallback = onComplete;
      }
      
      // Set the appropriate voice ID
      const voiceId = this.hostVoices[hostType];
      elevenlabsService.setVoice(voiceId);
      
      // Check if we already have this text in our cache
      const cacheKey = `${hostType}:${text}`;
      if (this.audioCache.has(cacheKey)) {
        console.log(`Using cached audio for ${hostType}`);
        const cachedAudioUrl = this.audioCache.get(cacheKey) || '';
        await this.playAudio(cachedAudioUrl);
        return cachedAudioUrl;
      }
      
      // Generate speech with ElevenLabs
      console.log(`Generating new audio for ${hostType}`);
      const audioUrl = await elevenlabsService.textToSpeech(text);
      
      if (audioUrl) {
        // Cache the result
        this.audioCache.set(cacheKey, audioUrl);
        
        // Play the audio
        console.log(`Playing audio for ${hostType}`);
        await this.playAudio(audioUrl);
        return audioUrl;
      } else {
        console.error(`Failed to get audio URL for ${hostType}`);
        // Call the callback even on error
        if (onComplete) {
          onComplete();
        }
        return '';
      }
      
    } catch (error) {
      console.error('Error generating podcast host speech:', error);
      // Call the callback even on error
      if (onComplete) {
        onComplete();
      }
      return '';
    }
  }
  
  /**
   * Play audio from a URL
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.audioElement) {
        console.error('Audio element not initialized');
        resolve();
        return;
      }
      
      // Set up event listeners for this specific playback
      const onEnded = () => {
        console.log('Audio playback ended');
        this.isPlaying = false;
        // Call the callback if it exists
        if (this.onSpeechEndCallback) {
          const callback = this.onSpeechEndCallback;
          this.onSpeechEndCallback = null;
          callback();
        }
        // Clean up event listeners
        this.audioElement?.removeEventListener('ended', onEnded);
        this.audioElement?.removeEventListener('error', onError);
        resolve();
      };
      
      const onError = (error: Event) => {
        console.error('Error playing audio:', error);
        this.isPlaying = false;
        // Call the callback even on error
        if (this.onSpeechEndCallback) {
          const callback = this.onSpeechEndCallback;
          this.onSpeechEndCallback = null;
          callback();
        }
        // Clean up event listeners
        this.audioElement?.removeEventListener('ended', onEnded);
        this.audioElement?.removeEventListener('error', onError);
        resolve();
      };
      
      // Add event listeners
      this.audioElement.addEventListener('ended', onEnded);
      this.audioElement.addEventListener('error', onError);
      
      // Set the audio source and play
      this.audioElement.src = audioUrl;
      this.isPlaying = true;
      
      // Play the audio
      const playPromise = this.audioElement.play();
      
      // Handle play promise (required for modern browsers)
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Error starting audio playback:', error);
          this.isPlaying = false;
          // Call the callback even on error
          if (this.onSpeechEndCallback) {
            const callback = this.onSpeechEndCallback;
            this.onSpeechEndCallback = null;
            callback();
          }
          // Clean up event listeners
          this.audioElement?.removeEventListener('ended', onEnded);
          this.audioElement?.removeEventListener('error', onError);
          resolve();
        });
      }
    });
  }
  
  /**
   * Stop any ongoing speech
   */
  stopSpeech(): void {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      
      // Clear any pending callbacks
      this.onSpeechEndCallback = null;
    }
  }
  
  /**
   * Check if speech is currently playing
   */
  isSpeaking(): boolean {
    return this.isPlaying;
  }
}

export const podcastVoiceService = new PodcastVoiceService();
