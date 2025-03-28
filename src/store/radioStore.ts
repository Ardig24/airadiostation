/**
 * Radio Store
 * 
 * Global state management for the AI Radio Station using Zustand.
 * Manages current track, playlist, AI DJ state, and user interactions.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { RadioState, ContentItem, Track } from '../types';
import { openaiService } from '../lib/openai';
import { elevenlabsService } from '../lib/elevenlabs';
import { supabaseService } from '../services/supabaseService';

// Helper function to convert Supabase track to our Track type
const convertTrack = (track: any): Track => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  file_url: track.file_url, 
  audioUrl: track.file_url, 
  duration: track.duration,
  coverArt: track.cover_art_url || `https://picsum.photos/seed/${track.id}/300/300`,
  genre: Array.isArray(track.genre) ? track.genre[0] : track.genre || 'Unknown'
});

// Create the radio store with Zustand
export const useRadioStore = create<RadioState>((set, get) => ({
  // Playback state
  isPlaying: false,
  isLoading: true,
  error: null,
  isDjSpeaking: false,
  isChatResponse: false, // New flag to differentiate between track announcements and chat responses
  isAudioPlaying: false, // Flag to track if any audio is currently playing
  isTrackChanging: false, // New flag to lock the track changing process
  
  // Content
  currentTrack: null,
  queue: [],
  history: [],
  playlist: [], // Add missing playlist property
  contentItems: [],
  userMessages: [],
  
  // Station info
  currentVoiceProfile: {
    id: 'default',
    name: 'DJ ByteBeat',
    personality: 'Energetic and knowledgeable about music'
  },
  currentPlaylist: {
    id: 'default',
    name: 'AI Radio Mix',
    description: 'A mix of tracks selected by our AI DJ'
  },
  listenerCount: Math.floor(Math.random() * 3000) + 1000,
  
  // Application state
  volume: 0.8,
  progress: 0,
  
  // Initialize the store
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get tracks and convert them to our format
      const rawTracks = await supabaseService.getTracks();
      const tracks = rawTracks.map(convertTrack);
      
      // Set initial state
      set({
        playlist: tracks,
        queue: [...tracks],
        currentTrack: null,
        isLoading: false
      });
      
      // Don't auto-play welcome message, wait for user interaction
      console.log('Radio station initialized, waiting for user to press play');
      
    } catch (error) {
      console.error('Error initializing radio store:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  },
  
  // Playback controls
  togglePlayPause: () => {
    const state = get();
    
    if (!state.isPlaying && !state.currentTrack) {
      // If not playing and no track, start with welcome message
      get().startWelcomeSequence();
    } else {
      // Otherwise just toggle play state
      set({ isPlaying: !state.isPlaying });
    }
  },
  
  startWelcomeSequence: async () => {
    try {
      console.log('Starting welcome sequence - skipping directly to first track');
      
      // Start first track immediately
      await get().nextTrack();
      
    } catch (error) {
      console.error('Error in welcome sequence:', error);
      // Try to start first track even if there's an error
      console.log('Attempting to recover by calling nextTrack');
      await get().nextTrack();
    }
  },
  
  play: () => {
    set({ isPlaying: true });
  },
  
  pause: () => {
    set({ isPlaying: false });
  },
  
  setVolume: (volume: number) => {
    set({ volume });
  },
  
  next: async () => {
    // Alias for nextTrack for compatibility
    return get().nextTrack();
  },
  
  nextTrack: async () => {
    try {
      console.log('nextTrack called');
      const state = get();
      
      // If audio is already playing, don't start another track
      if (state.isAudioPlaying) {
        console.log('Audio is already playing, ignoring nextTrack call');
        return;
      }
      
      // If track changing is locked, don't start another track
      if (state.isTrackChanging) {
        console.log('Track changing is locked, ignoring nextTrack call');
        return;
      }
      
      // Set the track changing flag to prevent multiple track changes
      set({ isTrackChanging: true });
      
      // Set the audio playing flag to prevent multiple audio elements
      set({ isAudioPlaying: true });
      
      // If no tracks in queue, fetch more
      if (state.queue.length === 0) {
        console.log('Queue is empty, fetching tracks');
        const tracks = await supabaseService.getTracks({ limit: 10 });
        console.log('Fetched tracks:', tracks);
        
        if (tracks.length === 0) {
          console.error('No tracks available');
          set({ error: 'No tracks available. Please try again later.', isAudioPlaying: false, isTrackChanging: false });
          return;
        }
        
        // Convert tracks to our format
        const convertedTracks = tracks.map(track => {
          return {
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverArt: track.cover_art_url || 'https://picsum.photos/seed/fallback/300/300', // Provide fallback
            file_url: track.file_url,
            audioUrl: track.file_url, // Set both file_url and audioUrl for compatibility
            duration: track.duration || 0
          };
        });
        console.log('Converted tracks:', convertedTracks);
        
        // Add tracks to queue
        set({ queue: convertedTracks });
      }
      
      // Get the next track from the queue
      const nextTrack = state.queue[0];
      const remainingQueue = state.queue.slice(1);
      
      console.log('Next track:', nextTrack);
      console.log('Remaining queue:', remainingQueue);
      
      // Update state with new track and queue
      set({ 
        currentTrack: nextTrack,
        queue: remainingQueue,
        isPlaying: true, // Set to playing state
        isChatResponse: false // Set to false for track announcements
      });
      
      // Generate DJ intro for the track
      try {
        console.log('Generating DJ intro for track');
        set({ isDjSpeaking: true });
        
        // Generate intro text
        const introText = await openaiService.generateTrackIntro(nextTrack);
        console.log('Generated intro text:', introText);
        
        // Add the intro to content items
        get().addContentItem(introText, 'announcement', {
          relatedTrackId: nextTrack.id
        });
        
        // Generate speech for the intro
        console.log('Generating speech for intro');
        const introAudioUrl = await elevenlabsService.textToSpeech(introText);
        console.log('Generated intro audio URL:', introAudioUrl);
        
        if (introAudioUrl) {
          // Play the intro audio
          console.log('Playing DJ intro audio');
          
          // Create a promise that resolves when the DJ audio finishes
          await new Promise<void>((resolve) => {
            const audio = new Audio();
            
            audio.onended = () => {
              console.log('DJ intro ended, track should start playing');
              set({ isDjSpeaking: false });
              // The AudioPlayer component will handle playing the actual track
              resolve();
            };
            
            audio.onerror = (e) => {
              console.error('Error playing DJ intro:', e);
              console.error('Audio error details:', {
                error: audio.error,
                networkState: audio.networkState,
                readyState: audio.readyState,
                src: audio.src
              });
              set({ isDjSpeaking: false });
              console.log('Error with DJ intro audio, continuing to track');
              resolve();
            };
            
            // Add more detailed logging
            audio.addEventListener('loadstart', () => console.log('DJ intro audio loadstart event'));
            audio.addEventListener('canplay', () => console.log('DJ intro audio canplay event'));
            audio.addEventListener('canplaythrough', () => console.log('DJ intro audio canplaythrough event'));
            audio.addEventListener('play', () => console.log('DJ intro audio play event'));
            audio.addEventListener('playing', () => console.log('DJ intro audio playing event'));
            
            // Load and play the audio
            audio.src = introAudioUrl;
            audio.load();
            console.log('DJ intro audio loaded, attempting to play');
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Error playing DJ intro:', error);
                console.error('This is likely due to browser autoplay restrictions');
                set({ isDjSpeaking: false });
                console.log('Autoplay blocked, continuing to track');
                resolve();
              });
            }
          });
        } else {
          console.log('No audio URL for DJ intro, skipping');
          set({ isDjSpeaking: false });
        }
      } catch (error) {
        console.error('Error generating DJ intro:', error);
        set({ isDjSpeaking: false });
      }
      
      // Clear the audio playing flag after everything is done
      set({ isAudioPlaying: false, isTrackChanging: false });
      
    } catch (error) {
      console.error('Error in nextTrack:', error);
      set({ error: 'Error playing next track. Please try again.', isAudioPlaying: false, isTrackChanging: false });
    }
  },
  
  previousTrack: async () => {
    const { history } = get();
    
    if (history.length === 0) return;
    
    // Get the last track from history
    const previousTrack = history[history.length - 1];
    
    // Update the store
    set((state) => ({
      currentTrack: previousTrack,
      history: state.history.slice(0, -1),
      isPlaying: true
    }));
  },
  
  // User interaction
  addUserMessage: async (content: string) => {
    try {
      console.log('User sent message:', content);
      
      // Add the message to the content items
      get().addContentItem(content, 'message');
      
      // Check if this is a song request
      if (content.toLowerCase().includes('play') && (content.toLowerCase().includes('song') || content.includes('"'))) {
        console.log('This appears to be a song request');
        // For now, just acknowledge the request
        // In a real implementation, this would search for the requested song and add it to the queue
        const responseText = `Thanks for your song request! I've added it to the queue.`;
        get().addContentItem(responseText, 'announcement');
      }
    } catch (error) {
      console.error('Error processing user message:', error);
    }
  },
  
  // Content management
  addContentItem: async (content: string, type: 'announcement' | 'news' | 'track' | 'message', options?: {
    title?: string;
    artist?: string;
    coverArt?: string;
    relatedTrackId?: string;
  }) => {
    const newItem: ContentItem = {
      id: uuidv4(),
      content,
      timestamp: new Date(),
      type,
      ...options
    };
    
    // Update the store
    set((state) => ({
      contentItems: [newItem, ...state.contentItems]
    }));
    
    return newItem;
  },
  
  // AI DJ state
  setDjSpeaking: (speaking: boolean): void => {
    set({ isDjSpeaking: speaking });
  }
}));

// Initialize the store when the app loads
if (typeof window !== 'undefined') {
  useRadioStore.getState().initialize();
}