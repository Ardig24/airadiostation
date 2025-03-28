/**
 * OpenAI Service
 * 
 * Handles interactions with the OpenAI API for generating DJ responses and track introductions.
 */

class OpenAIService {
  /**
   * Generate a response to a user message
   */
  async generateResponseToUser(message: string): Promise<string> {
    try {
      console.log('Generating response to user message:', message);
      
      // In a real implementation, this would call the OpenAI API
      // For now, we'll return hyped DJ responses based on the message content
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "YO YO YO! What's up, party people! Great to hear from you! How are you vibing with these SICK tracks today?! Keep that energy HIGH!";
      } else if (message.toLowerCase().includes('weather')) {
        return "Who cares about the weather when the BEATS are this HOT?! We're creating our own HEAT in here with these FIRE tracks! Let me know what you want to hear next!";
      } else if (message.toLowerCase().includes('favorite')) {
        return "OH MAN! You're asking about my favorites?! I've got TOO MANY to count! Right now I'm ABSOLUTELY OBSESSED with this electronic fusion we're playing! It's PURE FIRE! What genres are YOU into?!";
      } else {
        const hypedResponses = [
          "BOOM! Thanks for dropping in! I'm your AI DJ, here to keep these EPIC tracks coming! Let's CRANK UP the volume and FEEL THE ENERGY!",
          "YESSSS! Love the interaction! Keep those messages coming! I'm spinning the HOTTEST tracks just for YOU! What are you feeling right now?!",
          "WHAT'S UP! Your message just made my day! We're on a MUSICAL JOURNEY together! These beats are INSANE! Let me know what you want to hear next!",
          "HEY HEY HEY! Thanks for connecting! I'm dropping NOTHING BUT HITS today! The energy is THROUGH THE ROOF! Let's GOOOOO!"
        ];
        return hypedResponses[Math.floor(Math.random() * hypedResponses.length)];
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return "WHOA! Technical difficulties! But NO WORRIES! We're keeping these AMAZING tracks flowing while I sort things out! STAY TUNED!";
    }
  }

  /**
   * Generate an introduction for a track
   */
  async generateTrackIntro(track: any): Promise<string> {
    try {
      console.log('Generating intro for track:', track.title);
      
      // In a real implementation, this would call the OpenAI API
      // For now, we'll return a hyped intro
      const hypedIntros = [
        `COMING UP NEXT, we've got "${track.title}" by ${track.artist}! This track is ABSOLUTELY CRUSHING IT on the charts! Turn it UP and feel the ENERGY!`,
        `OH MY GOODNESS! Let's keep this INCREDIBLE vibe going with "${track.title}" from ${track.artist}! This one's a TOTAL BANGER! CRANK IT UP!`,
        `NOW PLAYING! "${track.title}" by ${track.artist}! This is one of my ABSOLUTE FAVORITES! It's the PERFECT track for RIGHT NOW! Let's GOOOOO!`,
        `GET READY for "${track.title}" by ${track.artist}! I've hand-selected this FIRE track just for YOU! Let me know what you think in the chat! It's about to get LIT in here!`
      ];
      
      return hypedIntros[Math.floor(Math.random() * hypedIntros.length)];
    } catch (error) {
      console.error('Error generating track intro:', error);
      return `NOW DROPPING "${track.title}" by ${track.artist}! This track is ABSOLUTE FIRE!`;
    }
  }
}

export const openaiService = new OpenAIService();
export default OpenAIService;
