import { createClient } from '@supabase/supabase-js';
import type { Track, UserMessage, ContentItem } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase service for database operations
export class SupabaseService {
  // Tracks
  async getTracks(filters?: { genre?: string; mood?: string }): Promise<Track[]> {
    try {
      let query = supabase.from('tracks').select('*');
      
      if (filters?.genre) {
        query = query.eq('genre', filters.genre);
      }
      
      if (filters?.mood) {
        query = query.eq('mood', filters.mood);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Track[] || [];
    } catch (error) {
      console.error('Error fetching tracks:', error);
      // Return mock data for development
      return this.getMockTracks();
    }
  }
  
  // User messages
  async saveUserMessage(message: Omit<UserMessage, 'id'>): Promise<UserMessage | null> {
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .insert([message])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as UserMessage;
    } catch (error) {
      console.error('Error saving user message:', error);
      return null;
    }
  }
  
  // Content items
  async saveContentItem(item: Omit<ContentItem, 'id'>): Promise<ContentItem | null> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as ContentItem;
    } catch (error) {
      console.error('Error saving content item:', error);
      return null;
    }
  }
  
  async getContentItems(limit: number = 10): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data as ContentItem[] || [];
    } catch (error) {
      console.error('Error fetching content items:', error);
      return this.getMockContentItems();
    }
  }
  
  // Mock data for development
  private getMockTracks(): Track[] {
    return [
      {
        id: '1',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        coverArt: 'https://example.com/covers/bohemian-rhapsody.jpg',
        audioUrl: 'https://example.com/tracks/bohemian-rhapsody.mp3',
        duration: 354,
        genre: 'Rock',
        releaseDate: '1975-10-31'
      },
      {
        id: '2',
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        coverArt: 'https://example.com/covers/billie-jean.jpg',
        audioUrl: 'https://example.com/tracks/billie-jean.mp3',
        duration: 294,
        genre: 'Pop',
        releaseDate: '1983-01-02'
      },
      {
        id: '3',
        title: 'Imagine',
        artist: 'John Lennon',
        coverArt: 'https://example.com/covers/imagine.jpg',
        audioUrl: 'https://example.com/tracks/imagine.mp3',
        duration: 183,
        genre: 'Rock',
        releaseDate: '1971-10-11'
      }
    ];
  }
  
  private getMockContentItems(): ContentItem[] {
    return [
      {
        id: '1',
        content: 'Welcome to AI Radio! I\'m your AI DJ and I\'ll be playing some great tunes for you today.',
        timestamp: new Date(),
        type: 'announcement'
      },
      {
        id: '2',
        content: 'Coming up next is a classic from Queen - Bohemian Rhapsody. This iconic song was released in 1975 and has remained a fan favorite for decades.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'track-intro',
        relatedTrackId: '1'
      },
      {
        id: '3',
        content: 'Breaking news: The annual music festival will be held next month featuring some of the biggest names in the industry!',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'news'
      }
    ];
  }
}

export const supabaseService = new SupabaseService();
