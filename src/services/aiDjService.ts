/**
 * AI DJ Service
 * 
 * This service handles the generation of AI DJ content and voice synthesis
 * using OpenAI for text generation and ElevenLabs for voice synthesis.
 */

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string[];
  duration?: number;
}

interface VoiceProfile {
  id: string;
  name: string;
  elevenlabsVoiceId: string;
  personality: string;
  speakingStyle?: string;
}

export class AiDjService {
  private currentVoiceProfile: VoiceProfile | null = null;
  private openAiApiKey: string;
  private elevenLabsApiKey: string;
  
  constructor() {
    this.openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }
  
  /**
   * Set the current voice profile for the AI DJ
   */
  public setVoiceProfile(profile: VoiceProfile): void {
    this.currentVoiceProfile = profile;
  }
  
  /**
   * Generate a track introduction script
   */
  public async generateTrackIntro(track: Track, previousTrack?: Track): Promise<string> {
    // If we don't have API keys, use a template-based approach
    if (!this.openAiApiKey) {
      return this.generateTemplateBasedIntro(track, previousTrack);
    }
    
    try {
      const prompt = this.createTrackIntroPrompt(track, previousTrack);
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error generating track intro:', error);
      // Fallback to template if API call fails
      return this.generateTemplateBasedIntro(track, previousTrack);
    }
  }
  
  /**
   * Generate a news update script
   */
  public async generateNewsUpdate(newsItems: string[]): Promise<string> {
    if (!this.openAiApiKey || newsItems.length === 0) {
      return "Here's the latest news update. Stay tuned for more information throughout the day.";
    }
    
    try {
      const prompt = `You are an AI radio DJ. Create a brief news update script based on these headlines: ${newsItems.join(', ')}. Keep it concise, engaging, and in a conversational radio DJ style.`;
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error generating news update:', error);
      return "Here's the latest news update. Stay tuned for more information throughout the day.";
    }
  }
  
  /**
   * Generate a weather forecast script
   */
  public async generateWeatherForecast(temperature: number, condition: string, location: string): Promise<string> {
    if (!this.openAiApiKey) {
      return `The weather in ${location} is currently ${condition} with a temperature of ${temperature} degrees. Stay tuned for more weather updates throughout the day.`;
    }
    
    try {
      const prompt = `You are an AI radio DJ. Create a brief weather forecast for ${location} where it's currently ${condition} with a temperature of ${temperature} degrees. Keep it concise, engaging, and in a conversational radio DJ style.`;
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error generating weather forecast:', error);
      return `The weather in ${location} is currently ${condition} with a temperature of ${temperature} degrees. Stay tuned for more weather updates throughout the day.`;
    }
  }
  
  /**
   * Generate a custom announcement
   */
  public async generateAnnouncement(topic: string, details: string): Promise<string> {
    if (!this.openAiApiKey) {
      return `Here's an important announcement about ${topic}: ${details}`;
    }
    
    try {
      const prompt = `You are an AI radio DJ. Create a brief announcement about ${topic} with these details: ${details}. Keep it concise, engaging, and in a conversational radio DJ style.`;
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error generating announcement:', error);
      return `Here's an important announcement about ${topic}: ${details}`;
    }
  }
  
  /**
   * Synthesize speech using ElevenLabs
   */
  public async synthesizeSpeech(text: string): Promise<Blob | null> {
    if (!this.elevenLabsApiKey || !this.currentVoiceProfile) {
      console.error('Missing ElevenLabs API key or voice profile');
      return null;
    }
    
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.currentVoiceProfile.elevenlabsVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${error.message || response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return null;
    }
  }
  
  /**
   * Create a track introduction prompt for OpenAI
   */
  private createTrackIntroPrompt(track: Track, previousTrack?: Track): string {
    let prompt = 'You are an AI radio DJ. ';
    
    if (this.currentVoiceProfile?.personality) {
      prompt += `Your personality is ${this.currentVoiceProfile.personality}. `;
    }
    
    prompt += `Create a brief introduction for the song "${track.title}" by ${track.artist}`;
    
    if (track.album) {
      prompt += ` from the album "${track.album}"`;
    }
    
    if (previousTrack) {
      prompt += `. The previous song was "${previousTrack.title}" by ${previousTrack.artist}`;
    }
    
    prompt += '. Keep it concise, engaging, and in a conversational radio DJ style.';
    
    return prompt;
  }
  
  /**
   * Call OpenAI API to generate text
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Generate a track introduction using templates (fallback method)
   */
  private generateTemplateBasedIntro(track: Track, previousTrack?: Track): string {
    const templates = [
      `Now playing: ${track.title} by ${track.artist}.`,
      `Up next, we have ${track.title} from ${track.artist}.`,
      `Let's continue with ${track.artist} and their track ${track.title}.`,
      `This is ${track.title} by ${track.artist}. Enjoy!`,
      `You're listening to ${track.title} by ${track.artist} on AI Radio.`
    ];
    
    // Add transition templates if we have a previous track
    if (previousTrack) {
      templates.push(
        `That was ${previousTrack.title} by ${previousTrack.artist}. Now, here's ${track.artist} with ${track.title}.`,
        `After ${previousTrack.artist}, let's listen to ${track.title} by ${track.artist}.`,
        `From ${previousTrack.artist} to ${track.artist}, here's ${track.title}.`
      );
    }
    
    // Randomly select a template
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

// Create a singleton instance
export const aiDjService = new AiDjService();
