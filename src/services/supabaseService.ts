/**
 * Supabase Service
 * 
 * This service handles all interactions with the Supabase backend
 * for the AI Radio Station project.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for database tables
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  file_url: string;
  cover_art_url?: string;
  genre?: string[];
  mood?: string[];
  tempo?: number;
  duration: number;
  created_at?: string;
  releaseDate?: string;
}

export interface Content {
  id: string;
  type: string;
  title: string;
  body: string;
  audio_url?: string;
  duration?: number;
  scheduled_for?: string;
  is_played: boolean;
  created_at?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_featured: boolean;
  created_at?: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  elevenlabs_voice_id: string;
  personality: string;
  speaking_style?: string;
  is_active: boolean;
  created_at?: string;
}

export interface UserInteraction {
  id: string;
  user_id?: string;
  type: 'message' | 'request' | 'feedback';
  content: string;
  response?: string;
  is_processed: boolean;
  created_at?: string;
}

// Additional interfaces for the missing tables
export interface ContentItem {
  id: string;
  type: string;
  content: string;
  title?: string;
  artist?: string;
  timestamp: Date;
}

export interface TrafficUpdate {
  id: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  created_at?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  audio_url?: string;
  duration?: number;
  created_at?: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  host?: string;
  image_url?: string;
  created_at?: string;
}

export interface TimeSlot {
  id: string;
  program_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at?: string;
}

export class SupabaseService {
  private supabase: SupabaseClient;
  private static instance: SupabaseService;
  
  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found. Using mock data.');
      // Create client with dummy values - will use mock data
      this.supabase = createClient('https://example.com', 'dummy-key');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }
  
  /**
   * Get the Supabase client instance
   */
  public getClient(): SupabaseClient {
    return this.supabase;
  }
  
  /**
   * Get all tracks or a subset based on filters
   */
  public async getTracks(_options?: {
    limit?: number;
    genre?: string;
    mood?: string;
  }): Promise<Track[]> {
    try {
      // For testing purposes, always use mock data
      console.log('Using mock tracks data for testing');
      return this.getMockTracks();
      
      /* Original code commented out for testing
      let query = this.supabase
        .from('tracks')
        .select('*');
      
      if (options?.genre) {
        query = query.contains('genre', [options.genre]);
      }
      
      if (options?.mood) {
        query = query.contains('mood', [options.mood]);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
      */
    } catch (error) {
      console.error('Error fetching tracks:', error);
      return this.getMockTracks();
    }
  }
  
  /**
   * Get a track by ID
   */
  public async getTrackById(id: string): Promise<Track | null> {
    try {
      const { data, error } = await this.supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching track:', error);
      return this.getMockTracks().find(track => track.id === id) || null;
    }
  }
  
  /**
   * Get all playlists or featured playlists
   */
  public async getPlaylists(featuredOnly: boolean = false): Promise<Playlist[]> {
    try {
      let query = this.supabase
        .from('playlists')
        .select('*');
      
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return this.getMockPlaylists();
    }
  }
  
  /**
   * Get tracks in a playlist
   */
  public async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    try {
      const { data, error } = await this.supabase
        .from('playlist_items')
        .select('track_id, position, tracks(*)')
        .eq('playlist_id', playlistId)
        .order('position');
      
      if (error) throw error;
      
      return data?.map(item => (item.tracks as unknown) as Track) || [];
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      return this.getMockTracks().slice(0, 5);
    }
  }
  
  /**
   * Get all active voice profiles
   */
  public async getVoiceProfiles(): Promise<VoiceProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('voice_profiles')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching voice profiles:', error);
      return this.getMockVoiceProfiles();
    }
  }
  
  /**
   * Save a user interaction (message, request, feedback)
   */
  public async saveUserInteraction(interaction: Omit<UserInteraction, 'id' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('interactions')
        .insert(interaction)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error('Error saving user interaction:', error);
      return 'mock-interaction-id';
    }
  }
  
  /**
   * Save generated content (announcements, news, etc.)
   */
  public async saveContent(content: Omit<Content, 'id' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('content')
        .insert(content)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error('Error saving content:', error);
      return 'mock-content-id';
    }
  }
  
  /**
   * Upload an audio file to storage
   */
  public async uploadAudioFile(file: File, path: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .storage
        .from('audio-content')
        .upload(path, file);
      
      if (error) throw error;
      
      const { data: urlData } = this.supabase
        .storage
        .from('audio-content')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      return null;
    }
  }

  /**
   * Get content items (announcements, news, etc.)
   */
  public async getContentItems(): Promise<ContentItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('content_items')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching content items:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  /**
   * Save a content item
   */
  public async saveContentItem(item: Omit<ContentItem, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('content_items')
        .insert(item)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error('Error saving content item:', error);
      // Return mock ID instead of throwing error
      return 'mock-content-item-id';
    }
  }

  /**
   * Get traffic updates
   */
  public async getTrafficUpdates(): Promise<TrafficUpdate[]> {
    try {
      const { data, error } = await this.supabase
        .from('traffic_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching traffic updates:', error);
      // Return mock data instead of throwing error
      return this.getMockTrafficUpdates();
    }
  }

  /**
   * Get advertisements
   */
  public async getAdvertisements(): Promise<Advertisement[]> {
    try {
      const { data, error } = await this.supabase
        .from('advertisements')
        .select('*')
        .limit(3);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      // Return mock data instead of throwing error
      return this.getMockAdvertisements();
    }
  }

  /**
   * Get current program based on time
   */
  public async getCurrentProgram(): Promise<Program | null> {
    try {
      // Get current day and time
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0-6, where 0 is Sunday
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Find current time slot
      const { data: timeSlots, error: timeSlotsError } = await this.supabase
        .from('time_slots')
        .select('*, programs(*)')
        .eq('day_of_week', dayOfWeek)
        .lte('start_time', currentTime)
        .gte('end_time', currentTime);
      
      if (timeSlotsError) throw timeSlotsError;
      
      if (timeSlots && timeSlots.length > 0) {
        return timeSlots[0].programs as unknown as Program;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current program:', error);
      // Return mock program instead of throwing error
      return this.getMockProgram();
    }
  }
  
  // Mock data methods for development/testing without Supabase
  
  private getMockTracks(): Track[] {
    return [
      {
        id: '1',
        title: 'Guitar Instrumental',
        artist: 'Sound Effects',
        album: 'Free Audio Collection',
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cover_art_url: 'https://picsum.photos/seed/track1/300/300',
        genre: ['Acoustic', 'Instrumental'],
        mood: ['Relaxing', 'Melodic'],
        tempo: 120,
        duration: 372, // Actual duration of SoundHelix-Song-1 is about 6:12 (372 seconds)
        created_at: new Date().toISOString(),
        releaseDate: '2023-01-01'
      },
      {
        id: '2',
        title: 'Electronic Beat',
        artist: 'Sound Library',
        album: 'Royalty Free Music',
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Using Song-3 instead of Song-2
        cover_art_url: 'https://picsum.photos/seed/track2/300/300',
        genre: ['Electronic', 'Dance'],
        mood: ['Energetic', 'Upbeat'],
        tempo: 140,
        duration: 380, // Approximate duration in seconds
        created_at: new Date().toISOString(),
        releaseDate: '2023-02-15'
      },
      {
        id: '3',
        title: 'Ambient Melody',
        artist: 'Audio Archive',
        album: 'Background Music',
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Using Song-8 for variety
        cover_art_url: 'https://picsum.photos/seed/track3/300/300',
        genre: ['Ambient', 'Chill'],
        mood: ['Calm', 'Atmospheric'],
        tempo: 90,
        duration: 395, // Approximate duration in seconds
        created_at: new Date().toISOString(),
        releaseDate: '2023-03-20'
      }
    ];
  }
  
  private getMockPlaylists(): Playlist[] {
    return [
      {
        id: '1',
        name: 'Morning Motivation',
        description: 'Start your day with these uplifting tracks',
        is_featured: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Afternoon Chill',
        description: 'Relaxing beats for your productive afternoon',
        is_featured: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Evening Vibes',
        description: 'Wind down with these smooth tracks',
        is_featured: false,
        created_at: new Date().toISOString()
      }
    ];
  }
  
  private getMockVoiceProfiles(): VoiceProfile[] {
    return [
      {
        id: '1',
        name: 'Alex',
        elevenlabs_voice_id: 'pNInz6obpgDQGcFmaJgB',
        personality: 'Friendly and energetic DJ who loves electronic music',
        speaking_style: 'Upbeat and enthusiastic',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Samantha',
        elevenlabs_voice_id: 'EXAVITQu4vr4xnSDxMaL',
        personality: 'Smooth-talking late night jazz DJ with a deep knowledge of music history',
        speaking_style: 'Calm and sophisticated',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  private getMockTrafficUpdates(): TrafficUpdate[] {
    return [
      {
        id: '1',
        location: 'Downtown Main Street',
        severity: 'medium',
        description: 'Construction causing delays of approximately 15 minutes',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        location: 'Highway 101 Northbound',
        severity: 'high',
        description: 'Major accident blocking two lanes, expect significant delays',
        created_at: new Date().toISOString()
      }
    ];
  }

  private getMockAdvertisements(): Advertisement[] {
    return [
      {
        id: '1',
        title: 'Summer Music Festival',
        content: 'Join us for the biggest music event of the summer! Featuring top artists and amazing food.',
        image_url: 'https://picsum.photos/seed/ad1/800/400',
        duration: 30,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'New Headphones Release',
        content: 'Experience music like never before with our new noise-cancelling headphones.',
        image_url: 'https://picsum.photos/seed/ad2/800/400',
        duration: 20,
        created_at: new Date().toISOString()
      }
    ];
  }

  private getMockProgram(): Program {
    return {
      id: '1',
      name: 'Morning Beats',
      description: 'Start your day with the latest hits and positive energy',
      host: 'DJ Alex',
      image_url: 'https://picsum.photos/seed/program1/400/400',
      created_at: new Date().toISOString()
    };
  }
}

// Create a singleton instance
export const supabaseService = SupabaseService.getInstance();
