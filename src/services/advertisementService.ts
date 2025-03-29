import { supabase } from '../lib/supabaseClient';

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  duration: number; // in seconds
  startDate: string;
  endDate: string;
  frequency: number; // how many times per day
  priority: number; // higher priority ads get played more often
  targetDemographic?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const advertisementService = {
  /**
   * Fetches all active advertisements
   */
  async getActiveAdvertisements(): Promise<Advertisement[]> {
    try {
      const now = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('isActive', true)
        .lte('startDate', now) // Start date is before or equal to today
        .gte('endDate', now)   // End date is after or equal to today
        .order('priority', { ascending: false }); // Higher priority first

      if (error) {
        console.error('Error fetching advertisements:', error);
        return this.getMockAdvertisements();
      }

      return data as Advertisement[];
    } catch (error) {
      console.error('Unexpected error fetching advertisements:', error);
      return this.getMockAdvertisements();
    }
  },

  /**
   * Gets a random advertisement based on priority weighting
   */
  async getRandomAdvertisement(): Promise<Advertisement | null> {
    try {
      const ads = await this.getActiveAdvertisements();
      
      if (ads.length === 0) {
        return null;
      }
      
      // Create a weighted selection based on priority
      const totalWeight = ads.reduce((sum, ad) => sum + ad.priority, 0);
      let random = Math.random() * totalWeight;
      
      for (const ad of ads) {
        random -= ad.priority;
        if (random <= 0) {
          return ad;
        }
      }
      
      // Fallback to first ad if something goes wrong with the weighted selection
      return ads[0];
    } catch (error) {
      console.error('Error getting random advertisement:', error);
      const mockAds = this.getMockAdvertisements();
      return mockAds.length > 0 ? mockAds[0] : null;
    }
  },

  /**
   * Creates a new advertisement
   */
  async createAdvertisement(ad: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Advertisement | null> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          ...ad,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating advertisement:', error);
        return null;
      }

      return data as Advertisement;
    } catch (error) {
      console.error('Unexpected error creating advertisement:', error);
      return null;
    }
  },

  /**
   * Updates an existing advertisement
   */
  async updateAdvertisement(id: string, updates: Partial<Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Advertisement | null> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating advertisement:', error);
        return null;
      }

      return data as Advertisement;
    } catch (error) {
      console.error('Unexpected error updating advertisement:', error);
      return null;
    }
  },

  /**
   * Deactivates an advertisement
   */
  async deactivateAdvertisement(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({
          isActive: false,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating advertisement:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deactivating advertisement:', error);
      return false;
    }
  },

  /**
   * Get mock advertisements when database is not available
   */
  getMockAdvertisements(): Advertisement[] {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30); // 30 days ago
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30); // 30 days in future
    
    return [
      {
        id: '1',
        title: 'AI Radio Station Mobile App',
        content: 'Introducing the revolutionary AI Radio Station app! Experience personalized music, intelligent DJs, and seamless streaming anywhere. Download now for the future of radio!',
        imageUrl: 'https://picsum.photos/seed/airadio/800/400',
        audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-radio-imaging-transition-sound-effect-1014.mp3',
        duration: 30,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        frequency: 15,
        priority: 10,
        targetDemographic: ['tech-enthusiasts', 'music-lovers', 'commuters'],
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: '2',
        title: 'AI Radio Premium Subscription',
        content: 'Upgrade to AI Radio Premium! Ad-free listening, exclusive AI-curated playlists, and voice-controlled music selection. Your perfect soundtrack, just a voice command away.',
        imageUrl: 'https://picsum.photos/seed/aipremium/800/400',
        audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-futuristic-marketing-sweep-transition-1009.mp3',
        duration: 20,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        frequency: 8,
        priority: 7,
        targetDemographic: ['subscribers', 'music-enthusiasts', 'premium-users'],
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: '3',
        title: 'AI Radio Station Smart Speaker Integration',
        content: 'Connect AI Radio Station to your smart home! Our new integration with popular smart speakers lets you control your music with just your voice. "Hey AI, play my favorites!"',
        imageUrl: 'https://picsum.photos/seed/aispeaker/800/400',
        audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-digital-technology-notification-2879.mp3',
        duration: 25,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        frequency: 10,
        priority: 8,
        targetDemographic: ['smart-home-users', 'tech-enthusiasts', 'early-adopters'],
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }
};
