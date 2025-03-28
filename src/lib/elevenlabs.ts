import { Track } from '../types';

// ElevenLabs voice synthesis service
export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string = 'pNInz6obpgDQGcFmaJgB'; // Default voice ID (Adam)
  
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('Missing ElevenLabs API key. Voice synthesis will not work.');
    }
  }
  
  // Set a different voice ID
  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }
  
  // Convert text to speech and return audio URL
  async textToSpeech(text: string): Promise<string | null> {
    console.log('ElevenLabs textToSpeech called with:', text);
    
    if (!this.apiKey) {
      console.error('Missing ElevenLabs API key. Voice synthesis will not work.');
      return null;
    }
    
    try {
      console.log('Making ElevenLabs API request with voice ID:', this.voiceId);
      console.log('Using API key:', this.apiKey.substring(0, 5) + '...');
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );
      
      console.log('ElevenLabs API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ElevenLabs API error response:', errorData);
        console.error(`ElevenLabs API error: ${response.status} - ${response.statusText}`);
        
        // For testing purposes, return a fallback audio URL
        console.log('Using fallback audio for testing');
        return 'https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3';
      }
      
      console.log('ElevenLabs API response received successfully');
      // Create a blob URL from the audio response
      const audioBlob = await response.blob();
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      if (audioBlob.size === 0) {
        console.error('Received empty audio blob from ElevenLabs');
        // For testing purposes, return a fallback audio URL
        return 'https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3';
      }
      
      const objectUrl = URL.createObjectURL(audioBlob);
      console.log('Created audio blob URL:', objectUrl);
      return objectUrl;
    } catch (error) {
      console.error('Error generating speech:', error);
      
      // For testing purposes, return a fallback audio URL
      console.log('Using fallback audio due to error');
      return 'https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3';
    }
  }
  
  // Generate a track introduction
  async generateTrackIntro(track: Track, previousTrack: Track | null = null): Promise<string | null> {
    const introText = this.createTrackIntroText(track, previousTrack);
    return this.textToSpeech(introText);
  }
  
  // Create text for track introduction
  private createTrackIntroText(track: Track, previousTrack: Track | null = null): string {
    // If we have a previous track, mention the transition
    if (previousTrack) {
      return `That was ${previousTrack.title} by ${previousTrack.artist}. Up next, we have ${track.title} by ${track.artist}. ${this.getRandomTrackFact(track)}`;
    }
    
    // If this is the first track
    return `Next up on AI Radio, we have ${track.title} by ${track.artist}. ${this.getRandomTrackFact(track)}`;
  }
  
  // Generate a random fact about the track
  private getRandomTrackFact(track: Track): string {
    const facts = [
      `This ${track.genre} track was released in ${track.releaseDate?.split('-')[0] || 'the past'}.`,
      `${track.artist} is known for their unique style in the ${track.genre} genre.`,
      `This is one of ${track.artist}'s most popular tracks.`,
      `I think you're going to love this one!`,
      `This track has a great beat that I'm sure you'll enjoy.`
    ];
    
    return facts[Math.floor(Math.random() * facts.length)];
  }
  
  // Generate a station announcement
  async generateAnnouncement(text: string): Promise<string | null> {
    return this.textToSpeech(text);
  }
}

export const elevenlabsService = new ElevenLabsService();
