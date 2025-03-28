/**
 * Chat DJ Service
 * 
 * Handles chat interactions with a separate DJ agent that doesn't affect music playback.
 * This service manages text-to-speech for chat responses without interfering with the music.
 */

import { openaiService } from '../services/openaiService';
import { elevenlabsService } from '../lib/elevenlabs';

class ChatDjService {
  private chatAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  
  /**
   * Generate a response to a user message and speak it
   */
  async respondToMessage(message: string, onSpeakingChange: (speaking: boolean) => void): Promise<string> {
    try {
      console.log('Chat DJ received message:', message);
      
      // Set speaking state to true
      this.isSpeaking = true;
      onSpeakingChange(true);
      
      // Generate response text using OpenAI
      const responseText = await openaiService.generateResponseToUser(message);
      console.log('Chat DJ response text:', responseText);
      
      // Generate speech for the response using ElevenLabs (same as audio player)
      const audioUrl = await elevenlabsService.textToSpeech(responseText);
      
      if (audioUrl) {
        // Stop any previous audio that might be playing
        if (this.chatAudio) {
          this.chatAudio.pause();
          this.chatAudio = null;
        }
        
        // Create a new audio element for the chat response
        this.chatAudio = new Audio(audioUrl);
        
        // Set volume for the chat audio
        this.chatAudio.volume = 0.8;
        
        // When the chat response ends, reset the speaking state
        this.chatAudio.onended = () => {
          console.log('Chat DJ response ended');
          this.isSpeaking = false;
          onSpeakingChange(false);
          this.chatAudio = null;
        };
        
        // Handle errors
        this.chatAudio.onerror = (error) => {
          console.error('Error playing Chat DJ response:', error);
          this.isSpeaking = false;
          onSpeakingChange(false);
          this.chatAudio = null;
        };
        
        // Play the response
        console.log('Playing Chat DJ response');
        await this.chatAudio.play().catch(error => {
          console.error('Error playing Chat DJ response:', error);
          this.isSpeaking = false;
          onSpeakingChange(false);
          this.chatAudio = null;
        });
      } else {
        console.log('No audio URL for Chat DJ response');
        this.isSpeaking = false;
        onSpeakingChange(false);
      }
      
      return responseText;
    } catch (error) {
      console.error('Error generating Chat DJ response:', error);
      this.isSpeaking = false;
      onSpeakingChange(false);
      return 'Sorry, I encountered an error while processing your message.';
    }
  }
  
  /**
   * Check if the chat DJ is currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
  
  /**
   * Stop any current speech
   */
  stopSpeaking(): void {
    if (this.chatAudio) {
      this.chatAudio.pause();
      this.chatAudio = null;
    }
    
    // Also cancel any Web Speech API speech in progress
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    this.isSpeaking = false;
  }
}

export const chatDjService = new ChatDjService();
