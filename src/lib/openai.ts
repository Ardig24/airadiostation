import { Track } from '../types';

// AI content generation service using OpenRouter with Google Gemini
export class OpenAIService {
  private apiKey: string;
  private modelName: string = 'google/gemini-2.5-pro-exp-03-25:free';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Missing OpenRouter API key. Content generation will use templates instead.');
    }
  }
  
  // Call OpenRouter API with a prompt
  async callOpenAI(prompt: string): Promise<string> {
    console.log('callOpenAI called with prompt:', prompt);
    
    if (!this.apiKey) {
      console.log('No OpenRouter API key, using template response');
      return this.getTemplateResponse(prompt);
    }
    
    try {
      console.log('Making OpenRouter API request');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Radio Station'
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'You are an AI DJ for a radio station. Your responses should be engaging, informative, and conversational.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error response:', errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      console.log('OpenRouter API response:', content);
      return content;
    } catch (error) {
      console.error('Error calling OpenRouter:', error);
      const templateResponse = this.getTemplateResponse(prompt);
      console.log('Using template response instead:', templateResponse);
      return templateResponse;
    }
  }
  
  // Generate track introduction
  async generateTrackIntro(track: Track, previousTrack: Track | null = null): Promise<string> {
    const prompt = this.createTrackIntroPrompt(track, previousTrack);
    return this.callOpenAI(prompt);
  }
  
  // Create prompt for track introduction
  private createTrackIntroPrompt(track: Track, previousTrack: Track | null = null): string {
    let prompt = `Create a brief and engaging introduction for the song "${track.title}" by ${track.artist}.`;
    
    if (track.genre) {
      prompt += ` The genre is ${track.genre}.`;
    }
    
    if (track.releaseDate) {
      prompt += ` It was released in ${track.releaseDate.split('-')[0]}.`;
    }
    
    if (previousTrack) {
      prompt += ` The previous song was "${previousTrack.title}" by ${previousTrack.artist}.`;
    }
    
    prompt += ` Keep it concise (30-50 words) and conversational, as if you're a radio DJ speaking to listeners.`;
    
    return prompt;
  }
  
  // Generate news update
  async generateNewsUpdate(): Promise<string> {
    const prompt = 'Create a brief music news update for a radio station. Include recent events, artist news, or upcoming releases. Keep it concise (30-50 words) and conversational.';
    return this.callOpenAI(prompt);
  }
  
  // Generate station announcement
  async generateAnnouncement(): Promise<string> {
    const prompt = 'Create a brief radio station announcement. It could be about upcoming features, listener appreciation, or general radio station information. Keep it concise (30-50 words) and conversational.';
    return this.callOpenAI(prompt);
  }
  
  // Generate response to user message
  async generateResponseToUser(userMessage: string): Promise<string> {
    // Make sure we use the full message
    const prompt = `A listener has sent this message: "${userMessage}". Create a brief, friendly response as if you're a radio DJ. Be enthusiastic and engaging. Make sure to reference the FULL content of their message in your response.`;
    return this.callOpenAI(prompt);
  }
  
  // Fallback template responses when API is not available
  private getTemplateResponse(prompt: string): string {
    // Check what type of content is being requested
    if (prompt.includes('introduction for the song')) {
      return this.getRandomTrackIntro();
    } else if (prompt.includes('news update')) {
      return this.getRandomNewsUpdate();
    } else if (prompt.includes('station announcement')) {
      return this.getRandomAnnouncement();
    } else if (prompt.includes('listener has sent this message')) {
      return this.getRandomUserResponse();
    } else {
      return this.getRandomAnnouncement();
    }
  }
  
  private getRandomTrackIntro(): string {
    const intros = [
      "Alright music lovers! Get ready for an absolute BANGER coming your way! This track is guaranteed to get your energy up and your feet moving! Let's crank up the volume! 🔥",
      "Oh WOW! I'm super excited to play this next masterpiece for you! It's been blowing up the charts and I just KNOW you're going to love every second of it! Let's dive in!",
      "Hold onto your headphones, because this next track is about to take you on an incredible musical journey! The beat, the melody, the vibe - it's all PERFECTION! Here we go!",
      "I've been waiting ALL DAY to play this next track for you! It's got that special something that makes it absolutely irresistible! Turn it up and let yourself feel the rhythm!",
      "This next song? Absolute FIRE! I can't stop playing it on repeat, and I bet you'll be doing the same! Get ready for a mind-blowing musical experience!",
      "Coming in HOT with this next track that's been dominating the airwaves! The energy is unmatched and the production is stellar! You're in for a treat!",
      "I'm literally bouncing in my chair right now because I get to share THIS incredible song with you! It's the definition of a perfect track! Let's enjoy it together!"
    ];
    
    return intros[Math.floor(Math.random() * intros.length)];
  }
  
  private getRandomNewsUpdate(): string {
    const updates = [
      "In music news today, several artists have announced new tour dates for the summer. Stay tuned for more details!",
      "The music charts are seeing some exciting new entries this week, with several debut albums making a splash.",
      "A major music festival has just announced its lineup for next year, featuring some of the biggest names in the industry.",
      "Award season is approaching, and nominations for the major music awards have been announced.",
      "Several classic albums are getting special anniversary re-releases with bonus content for fans."
    ];
    
    return updates[Math.floor(Math.random() * updates.length)];
  }
  
  private getRandomAnnouncement(): string {
    const announcements = [
      "You're listening to AI Radio, where we bring you the best music all day, every day.",
      "Thanks for tuning in to AI Radio. We appreciate all our listeners!",
      "Don't forget to check out our website for playlists and upcoming features.",
      "AI Radio - your number one source for the latest hits and greatest classics.",
      "Stay tuned for more great music and updates throughout the day on AI Radio."
    ];
    
    return announcements[Math.floor(Math.random() * announcements.length)];
  }
  
  private getRandomUserResponse(): string {
    const responses = [
      "BOOM! Thanks for your COMPLETE message! I've read EVERY WORD and I'm totally here for it! Keep those awesome messages coming, and enjoy the EPIC music!",
      "You're AMAZING for sending that message! I've got your FULL request and I'm on it! Let's keep this awesome music flowing just for YOU!",
      "WOW! I absolutely LOVE hearing from listeners like you! Your complete message means the world to me! Keep that energy up as we dive into more incredible tracks!",
      "OH YEAH! Your message just made my day! I've got EVERYTHING you said and I'm all about it! Let's keep this incredible radio experience going strong!",
      "You're what makes this radio station AWESOME! Thanks for your complete message - every word matters to us! Keep those vibes high as we continue with more fantastic music!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const openaiService = new OpenAIService();
