import { Track } from '../types';

// ElevenLabs voice synthesis service
export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string = 'pNInz6obpgDQGcFmaJgB'; // Default voice ID (Adam)
  
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'mock-api-key';
    
    if (!this.apiKey || this.apiKey === 'mock-api-key') {
      console.error('Missing ElevenLabs API key or using mock implementation. Voice synthesis may not work as expected.');
    }
  }
  
  // Set a different voice ID
  setVoice(voiceId: string): void {
    console.log('Setting voice ID to:', voiceId);
    this.voiceId = voiceId;
  }
  
  // Simple hash function to create variation in mock audio
  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  // Convert text to speech and return audio URL
  async textToSpeech(text: string): Promise<string | null> {
    console.log('ElevenLabs textToSpeech called with:', text.substring(0, 50) + '...');
    console.log('Using voice ID:', this.voiceId);
    
    // For testing without an API key, use mock audio URLs
    if (this.apiKey === 'mock-api-key') {
      console.log('Using mock audio implementation');
      
      // Create a deterministic but varied selection of audio files based on text content
      // This ensures different messages get different audio files
      const textHash = this.simpleHash(text);
      console.log(`Generated hash for text: ${textHash}`);
      
      // Use different test audio files for different voices
      const alexAudioOptions = [
        'https://assets.mixkit.co/sfx/preview/mixkit-male-voice-cheer-2010.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-cartoon-man-scream-477.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-male-voice-countdown-1954.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-crowd-male-cheer-and-applause-510.mp3'
      ];
      
      const rachelAudioOptions = [
        'https://assets.mixkit.co/sfx/preview/mixkit-female-voice-countdown-321.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-girl-saying-woohoo-343.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-female-long-scream-476.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-female-giggle-493.mp3'
      ];
      
      // Select audio based on voice ID and text hash
      if (this.voiceId === 'pNInz6obpgDQGcFmaJgB') { // Alex/Adam voice
        const selectedIndex = textHash % alexAudioOptions.length;
        const selectedAudio = alexAudioOptions[selectedIndex];
        console.log(`Selected Alex audio ${selectedIndex + 1}/${alexAudioOptions.length}: ${selectedAudio}`);
        return selectedAudio;
      } else if (this.voiceId === 'EXAVITQu4vr4xnSDxMaL') { // Rachel voice
        const selectedIndex = textHash % rachelAudioOptions.length;
        const selectedAudio = rachelAudioOptions[selectedIndex];
        console.log(`Selected Rachel audio ${selectedIndex + 1}/${rachelAudioOptions.length}: ${selectedAudio}`);
        return selectedAudio;
      } else {
        // Default fallback
        console.log('Using default audio fallback');
        return 'https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3';
      }
    }
    
    try {
      console.log('Making ElevenLabs API request with voice ID:', this.voiceId);
      
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error (${response.status}):`, errorText);
        return null;
      }
      
      // Get the audio data
      const audioBlob = await response.blob();
      console.log('Received audio blob of size:', audioBlob.size);
      
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Created audio URL:', audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error('Error in ElevenLabs text-to-speech:', error);
      return null;
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
