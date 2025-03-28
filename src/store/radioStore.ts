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
  isAudioPlaying: false, // New flag to track if any audio is currently playing
  
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
      console.log('Starting welcome sequence');
      const state = get();
      const { setDjSpeaking } = get();
      
      // If audio is already playing, don't start welcome sequence
      if (state.isAudioPlaying) {
        console.log('Audio is already playing, ignoring welcome sequence');
        return;
      }
      
      // Set the audio playing flag to prevent multiple audio elements
      set({ isAudioPlaying: true });
      
      // Generate welcome announcement
      const welcomeText = 'Welcome to AI Radio! I\'m DJ ByteBeat and I\'ll be playing some great tunes for you today.';
      console.log('Welcome text:', welcomeText);
      
      // Generate speech for welcome announcement
      setDjSpeaking(true);
      console.log('Calling elevenlabsService.generateAnnouncement');
      const audioUrl = await elevenlabsService.generateAnnouncement(welcomeText);
      console.log('Received audio URL from elevenlabsService:', audioUrl);
      
      if (audioUrl) {
        console.log('Playing welcome message audio');
        // Create a promise that resolves when the DJ audio finishes
        await new Promise<void>((resolve) => {
          const audio = new Audio();
          
          audio.onended = () => {
            console.log('Welcome message ended, starting first track');
            setDjSpeaking(false);
            resolve();
          };
          
          audio.onerror = (e) => {
            console.error('Error playing welcome message:', e);
            console.error('Audio error details:', {
              error: audio.error,
              networkState: audio.networkState,
              readyState: audio.readyState,
              src: audio.src
            });
            setDjSpeaking(false);
            // Don't reject, just continue to the next track
            console.log('Error with welcome audio, continuing to first track');
            resolve();
          };
          
          // Add more detailed logging
          audio.addEventListener('loadstart', () => console.log('Welcome audio loadstart event'));
          audio.addEventListener('canplay', () => console.log('Welcome audio canplay event'));
          audio.addEventListener('canplaythrough', () => console.log('Welcome audio canplaythrough event'));
          audio.addEventListener('play', () => console.log('Welcome audio play event'));
          audio.addEventListener('playing', () => console.log('Welcome audio playing event'));
          
          // Load and play the audio
          audio.src = audioUrl;
          audio.load();
          console.log('Welcome audio loaded, attempting to play');
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error playing welcome message:', error);
              console.error('This is likely due to browser autoplay restrictions');
              setDjSpeaking(false);
              // Don't reject, just continue to the next track
              console.log('Autoplay blocked, continuing to first track');
              resolve();
            });
          }
        });
      } else {
        console.log('No audio URL received for welcome message');
        setDjSpeaking(false);
      }
      
      // Clear the audio playing flag before starting the next track
      set({ isAudioPlaying: false });
      
      // Start first track after welcome message
      console.log('Welcome sequence completed, calling nextTrack');
      await get().nextTrack();
      
    } catch (error) {
      console.error('Error in welcome sequence:', error);
      const { setDjSpeaking } = get();
      setDjSpeaking(false);
      // Reset the audio playing flag
      set({ isAudioPlaying: false });
      // Try to start first track even if welcome fails
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
      const { setDjSpeaking } = get();
      
      // If audio is already playing, don't start another track
      if (state.isAudioPlaying) {
        console.log('Audio is already playing, ignoring nextTrack call');
        return;
      }
      
      // Set the audio playing flag to prevent multiple audio elements
      set({ isAudioPlaying: true });
      
      // If no tracks in queue, fetch more
      if (state.queue.length === 0) {
        console.log('Queue is empty, fetching tracks');
        const tracks = await supabaseService.getTracks({ limit: 10 });
        console.log('Fetched tracks:', tracks);
        
        if (tracks.length === 0) {
          console.error('No tracks available');
          set({ error: 'No tracks available. Please try again later.', isAudioPlaying: false });
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
        isPlaying: true // Set to playing state
      });
      
      // Generate DJ intro for the track
      try {
        console.log('Generating DJ intro for track');
        setDjSpeaking(true);
        
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
              setDjSpeaking(false);
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
              setDjSpeaking(false);
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
                setDjSpeaking(false);
                console.log('Autoplay blocked, continuing to track');
                resolve();
              });
            }
          });
        } else {
          console.log('No audio URL for DJ intro, skipping');
          setDjSpeaking(false);
        }
      } catch (error) {
        console.error('Error generating DJ intro:', error);
        setDjSpeaking(false);
      }
      
      // Clear the audio playing flag after everything is done
      set({ isAudioPlaying: false });
      
    } catch (error) {
      console.error('Error in nextTrack:', error);
      set({ error: 'Error playing next track. Please try again.', isAudioPlaying: false });
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
    const { setDjSpeaking } = get();
    
    try {
      // Generate response text
      const responseText = await openaiService.generateResponseToUser(content);
      
      // Generate speech for response
      setDjSpeaking(true);
      const audioUrl = await elevenlabsService.textToSpeech(responseText);
      
      if (audioUrl) {
        // Play the response
        const audio = new Audio(audioUrl);
        audio.onended = () => setDjSpeaking(false);
        audio.play();
      } else {
        setDjSpeaking(false);
      }
    } catch (error) {
      console.error('Error generating AI DJ response:', error);
      setDjSpeaking(false);
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