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
        title: 'Summer Music Festival',
        content: 'Join us for the biggest music event of the summer! Featuring top artists and amazing food.',
        imageUrl: 'https://picsum.photos/seed/ad1/800/400',
        audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-radio-imaging-transition-sound-effect-1014.mp3',
        duration: 30,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        frequency: 10,
        priority: 5,
        targetDemographic: ['music-lovers', 'young-adults'],
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: '2',
        title: 'New Headphones Release',
        content: 'Experience music like never before with our new noise-cancelling headphones.',
        imageUrl: 'https://picsum.photos/seed/ad2/800/400',
        audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-futuristic-marketing-sweep-transition-1009.mp3',
        duration: 20,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        frequency: 8,
        priority: 3,
        targetDemographic: ['audiophiles', 'tech-enthusiasts'],
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }
};
