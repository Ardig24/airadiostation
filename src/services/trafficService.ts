import { supabase } from '../lib/supabaseClient';

export interface TrafficUpdate {
  id: string;
  region: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
  description: string;
  affectedRoutes: string[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const trafficService = {
  /**
   * Fetches active traffic updates for a region
   */
  async getTrafficUpdates(region: string): Promise<TrafficUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('traffic_updates')
        .select('*')
        .eq('isActive', true)
        .eq('region', region)
        .order('severity', { ascending: false }); // Most severe first

      if (error) {
        console.error('Error fetching traffic updates:', error);
        // Return mock data when the table doesn't exist
        return this.getMockTrafficUpdates(region);
      }

      return data as TrafficUpdate[];
    } catch (error) {
      console.error('Unexpected error fetching traffic updates:', error);
      return this.getMockTrafficUpdates(region);
    }
  },

  /**
   * Creates a new traffic update
   */
  async createTrafficUpdate(update: Omit<TrafficUpdate, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrafficUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('traffic_updates')
        .insert({
          ...update,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating traffic update:', error);
        return null;
      }

      return data as TrafficUpdate;
    } catch (error) {
      console.error('Unexpected error creating traffic update:', error);
      return null;
    }
  },

  /**
   * Updates an existing traffic update
   */
  async updateTrafficUpdate(id: string, updates: Partial<Omit<TrafficUpdate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TrafficUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('traffic_updates')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating traffic update:', error);
        return null;
      }

      return data as TrafficUpdate;
    } catch (error) {
      console.error('Unexpected error updating traffic update:', error);
      return null;
    }
  },

  /**
   * Deactivates a traffic update
   */
  async deactivateTrafficUpdate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('traffic_updates')
        .update({
          isActive: false,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating traffic update:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deactivating traffic update:', error);
      return false;
    }
  },

  /**
   * Gets a traffic announcement for radio broadcast
   */
  async getTrafficAnnouncement(region: string): Promise<string> {
    const updates = await this.getTrafficUpdates(region);
    
    if (updates.length === 0) {
      return `Traffic is currently flowing smoothly in ${region}. No significant delays to report.`;
    }
    
    // Sort by severity
    const sortedUpdates = [...updates].sort((a, b) => {
      const severityOrder = { 'severe': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    let announcement = `Traffic update for ${region}. `;
    
    if (sortedUpdates.length === 1) {
      const update = sortedUpdates[0];
      announcement += `${update.description} `;
      
      if (update.affectedRoutes && update.affectedRoutes.length > 0) {
        announcement += `Affecting ${update.affectedRoutes.join(', ')}. `;
      }
      
      announcement += this.getSeverityPhrase(update.severity);
    } else {
      announcement += `We have ${sortedUpdates.length} traffic incidents to report. `;
      
      sortedUpdates.forEach((update, index) => {
        announcement += `${index + 1}: ${update.description}. `;
        
        if (update.affectedRoutes && update.affectedRoutes.length > 0) {
          announcement += `Affecting ${update.affectedRoutes.join(', ')}. `;
        }
        
        announcement += `${this.getSeverityPhrase(update.severity)} `;
      });
    }
    
    return announcement;
  },
  
  /**
   * Get severity phrase for announcements
   */
  getSeverityPhrase(severity: string): string {
    switch (severity) {
      case 'severe':
        return 'This is causing major disruption. Please seek alternative routes if possible.';
      case 'high':
        return 'Expect significant delays in this area.';
      case 'medium':
        return 'Moderate delays are expected.';
      case 'low':
      default:
        return 'Minor delays may occur.';
    }
  },

  /**
   * Get mock traffic updates when database is not available
   */
  getMockTrafficUpdates(region: string): TrafficUpdate[] {
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    return [
      {
        id: '1',
        region: region,
        severity: 'medium',
        description: `Construction work on Main Street in ${region}`,
        affectedRoutes: ['Main St', 'First Ave'],
        startTime: now.toISOString(),
        endTime: later.toISOString(),
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: '2',
        region: region,
        severity: 'high',
        description: `Major accident on Highway 101 Northbound near ${region} exit`,
        affectedRoutes: ['Highway 101 N', 'Exit 42'],
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour later
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }
};
