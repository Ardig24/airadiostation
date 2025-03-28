/**
 * ElevenLabs Service
 * 
 * Handles interactions with the ElevenLabs API for text-to-speech generation.
 */

class ElevenLabsService {
  private audioCache: Map<string, string> = new Map();
  
  /**
   * Convert text to speech using Web Speech API as a fallback for ElevenLabs
   */
  async textToSpeech(text: string): Promise<string> {
    try {
      console.log('Converting text to speech:', text);
      
      // Check if we already have this text in our cache
      if (this.audioCache.has(text)) {
        return this.audioCache.get(text) || '';
      }
      
      // In a real implementation, this would call the ElevenLabs API
      // For development, we'll use the Web Speech API to generate speech from the actual text
      const audioUrl = await this.generateSpeechBlob(text);
      
      // Cache the result
      if (audioUrl) {
        this.audioCache.set(text, audioUrl);
      }
      
      return audioUrl;
    } catch (error) {
      console.error('Error converting text to speech:', error);
      return '';
    }
  }
  
  /**
   * Generate speech using the Web Speech API and convert to a blob URL
   */
  private generateSpeechBlob(text: string): Promise<string> {
    return new Promise((resolve) => {
      // If Web Speech API is not available, return empty string
      if (!window.speechSynthesis) {
        console.warn('Web Speech API not available');
        resolve('');
        return;
      }
      
      // Create a new utterance with the provided text
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties for a hyped, energetic DJ voice
      utterance.rate = 1.1;  // Slightly faster than normal
      utterance.pitch = 1.2; // Higher pitch for more energy
      utterance.volume = 1.0; // Full volume
      
      // Try to use a male voice if available for the hyped DJ style
      const voices = window.speechSynthesis.getVoices();
      
      // First try to find an English voice with 'male' in the name
      let hypedDjVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('male') && 
        voice.lang.startsWith('en')
      );
      
      // If no male English voice found, try any male voice
      if (!hypedDjVoice) {
        hypedDjVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male')
        );
      }
      
      // If still no male voice found, try any English voice
      if (!hypedDjVoice) {
        hypedDjVoice = voices.find(voice => 
          voice.lang.startsWith('en')
        );
      }
      
      if (hypedDjVoice) {
        utterance.voice = hypedDjVoice;
      }
      
      // Simulate a delay for API call
      setTimeout(() => {
        // Speak the text
        window.speechSynthesis.speak(utterance);
        
        // Since we can't easily convert Web Speech API output to a blob URL,
        // we'll return a placeholder that signals the speech is being handled directly
        resolve('web-speech-api://direct');
      }, 300);
    });
  }
}

export const elevenlabsService = new ElevenLabsService();
