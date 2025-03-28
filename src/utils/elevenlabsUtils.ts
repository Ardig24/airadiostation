/**
 * ElevenLabs Utilities
 * 
 * Utility functions for working with the ElevenLabs API
 * for voice synthesis in the AI Radio Station.
 */

// Voice synthesis options
export interface VoiceSynthesisOptions {
  text: string;
  voiceId: string;
  stability?: number; // 0-1, default 0.5
  clarity?: number;  // 0-1, default 0.75 (similarity_boost in API)
  style?: number;    // 0-1, default 0.5
}

// Voice streaming options
export interface VoiceStreamOptions extends VoiceSynthesisOptions {
  onDataStart?: () => void;
  onDataEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * Generate speech using ElevenLabs API
 * @returns A blob containing the audio data
 */
export async function generateSpeech(options: VoiceSynthesisOptions, apiKey: string): Promise<Blob> {
  const { voiceId, text, stability = 0.5, clarity = 0.75, style = 0.5 } = options;
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
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

/**
 * Play an audio blob
 */
export function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    
    audio.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    
    audio.play().catch(reject);
  });
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(apiKey: string): Promise<any[]> {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ElevenLabs API error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.voices || [];
}

/**
 * Format text for better speech synthesis
 * 
 * Adds punctuation, fixes common issues, and improves
 * the text for better voice synthesis results.
 */
export function formatTextForSpeech(text: string): string {
  // Make sure text ends with punctuation
  if (!text.match(/[.!?]$/)) {
    text += '.';
  }
  
  // Add pauses for better speech rhythm
  text = text.replace(/([.!?]) ([A-Z])/g, '$1 <break time="0.5s"/> $2');
  
  // Emphasize important words (like song titles and artists)
  text = text.replace(/"([^"]+)"/g, '<emphasis>$1</emphasis>');
  
  return text;
}

/**
 * Calculate estimated cost of ElevenLabs API call
 * 
 * Based on character count and current pricing
 * (as of March 2025)
 */
export function calculateElevenLabsCost(text: string): number {
  // Remove SSML tags for character count
  const cleanText = text.replace(/<[^>]+>/g, '');
  const charCount = cleanText.length;
  
  // Current pricing: $0.0003 per character
  const costPerChar = 0.0003;
  return charCount * costPerChar;
}

/**
 * Cache for storing generated audio to reduce API calls
 */
class AudioCache {
  private cache: Map<string, Blob> = new Map();
  private maxSize: number = 50; // Maximum number of items to cache
  
  public get(key: string): Blob | undefined {
    return this.cache.get(key);
  }
  
  public set(key: string, value: Blob): void {
    // If cache is full, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, value);
  }
  
  public has(key: string): boolean {
    return this.cache.has(key);
  }
  
  public clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance of the cache
export const audioCache = new AudioCache();

/**
 * Generate speech with caching
 * 
 * Uses the cache to avoid regenerating the same speech
 */
export async function generateSpeechWithCache(
  options: VoiceSynthesisOptions, 
  apiKey: string
): Promise<Blob> {
  // Create a cache key based on the options
  const cacheKey = JSON.stringify(options);
  
  // Check if we have a cached version
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }
  
  // Generate new speech
  const audioBlob = await generateSpeech(options, apiKey);
  
  // Cache the result
  audioCache.set(cacheKey, audioBlob);
  
  return audioBlob;
}
