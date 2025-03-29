import { TimeSlot, Program, WeeklySchedule, CurrentProgram } from '../types/schedule';
import { mockTimeSlots, mockPrograms, getCurrentMockProgram } from '../data/mockSchedule';

/**
 * Service for managing the radio station schedule
 */
export const scheduleService = {
  /**
   * Fetches the complete weekly schedule
   */
  async getWeeklySchedule(): Promise<WeeklySchedule | null> {
    try {
      // Use mock data instead of Supabase
      const data = mockTimeSlots;

      // Group by days of week
      const scheduleByDay = data.reduce((acc: Record<number, TimeSlot[]>, timeSlot: TimeSlot) => {
        // For each day this slot is active
        timeSlot.daysOfWeek.forEach(day => {
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(timeSlot);
        });
        
        return acc;
      }, {} as Record<number, TimeSlot[]>);

      // Convert to WeeklySchedule format
      const weeklySchedule: WeeklySchedule = {
        days: Object.entries(scheduleByDay).map(([day, slots]) => ({
          day: parseInt(day),
          slots: slots
        }))
      };

      return weeklySchedule;
    } catch (error) {
      console.error('Unexpected error fetching schedule:', error);
      return null;
    }
  },

  /**
   * Gets the current program based on the current time
   */
  async getCurrentProgram(): Promise<CurrentProgram | null> {
    try {
      // Use mock data instead of Supabase
      return getCurrentMockProgram();
    } catch (error) {
      console.error('Error fetching current program:', error);
      return null;
    }
  },

  /**
   * Gets the next scheduled program
   */
  async getNextProgram(afterTime: string, day: number): Promise<(TimeSlot & { program: Program }) | null> {
    try {
      // Find slots for the current day that start after the given time
      let nextSlots = mockTimeSlots.filter(slot => {
        return slot.daysOfWeek.includes(day) && slot.startTime > afterTime;
      });
      
      // Sort by start time
      nextSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      // If there's a next slot today, return it
      if (nextSlots.length > 0) {
        const nextSlot = nextSlots[0];
        // Find the corresponding program
        const program = mockPrograms.find(p => p.title === nextSlot.title) || {
          id: `generated-${nextSlot.id}`,
          type: nextSlot.programType,
          title: nextSlot.title,
          description: nextSlot.description,
          hostDjId: 'dj1', // Default DJ
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return { ...nextSlot, program };
      }
      
      // Otherwise, find the first slot of the next day
      const nextDay = (day + 1) % 7;
      nextSlots = mockTimeSlots.filter(slot => slot.daysOfWeek.includes(nextDay));
      
      // Sort by start time
      nextSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      if (nextSlots.length > 0) {
        const nextSlot = nextSlots[0];
        // Find the corresponding program
        const program = mockPrograms.find(p => p.title === nextSlot.title) || {
          id: `generated-${nextSlot.id}`,
          type: nextSlot.programType,
          title: nextSlot.title,
          description: nextSlot.description,
          hostDjId: 'dj1', // Default DJ
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return { ...nextSlot, program };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting next program:', error);
      return null;
    }
  },

  /**
   * Creates a new time slot in the schedule
   */
  async createTimeSlot(timeSlot: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeSlot | null> {
    try {
      // In a real app, this would insert into Supabase
      // For now, just return a mock response
      const newTimeSlot: TimeSlot = {
        ...timeSlot,
        id: `new-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return newTimeSlot;
    } catch (error) {
      console.error('Error creating time slot:', error);
      return null;
    }
  },

  /**
   * Updates an existing time slot
   */
  async updateTimeSlot(id: string, updates: Partial<Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TimeSlot | null> {
    try {
      // In a real app, this would update Supabase
      // For now, just return a mock response
      const existingSlot = mockTimeSlots.find(slot => slot.id === id);
      
      if (!existingSlot) {
        throw new Error('Time slot not found');
      }
      
      const updatedSlot: TimeSlot = {
        ...existingSlot,
        ...updates,
        updatedAt: new Date()
      };
      
      return updatedSlot;
    } catch (error) {
      console.error('Error updating time slot:', error);
      return null;
    }
  },

  /**
   * Creates a new program
   */
  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program | null> {
    try {
      // In a real app, this would insert into Supabase
      // For now, just return a mock response
      const newProgram: Program = {
        ...program,
        id: `new-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return newProgram;
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  },

  /**
   * Helper function to convert HH:MM time to minutes for calculations
   */
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
};
