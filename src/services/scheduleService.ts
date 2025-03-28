import { supabase } from '../lib/supabaseClient';
import { TimeSlot, Program, WeeklySchedule, CurrentProgram } from '../types/schedule';

/**
 * Service for managing the radio station schedule
 */
export const scheduleService = {
  /**
   * Fetches the complete weekly schedule
   */
  async getWeeklySchedule(): Promise<WeeklySchedule | null> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('isActive', true)
        .order('startTime', { ascending: true });

      if (error) {
        console.error('Error fetching schedule:', error);
        return null;
      }

      // Group by days of week
      const scheduleByDay = data.reduce((acc: Record<number, TimeSlot[]>, slot: any) => {
        const timeSlot = slot as unknown as TimeSlot;
        
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
          slots: slots as TimeSlot[]
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
      // Get current time in HH:MM format
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay(); // 0-6 representing Sunday-Saturday

      // Query for current time slot
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('isActive', true)
        .contains('daysOfWeek', [currentDay])
        .lte('startTime', currentTime)
        .gte('endTime', currentTime)
        .single();

      if (error) {
        console.error('Error fetching current program:', error);
        return null;
      }

      if (!data) {
        console.warn('No program found for current time');
        return null;
      }

      // Calculate progress percentage
      const slot = data as unknown as TimeSlot & { program: Program };
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);
      const currentMinutes = this.timeToMinutes(currentTime);
      const totalMinutes = endMinutes - startMinutes;
      const elapsedMinutes = currentMinutes - startMinutes;
      const progress = Math.round((elapsedMinutes / totalMinutes) * 100);

      // Get next program
      const nextProgram = await this.getNextProgram(slot.endTime, currentDay);

      return {
        ...slot.program,
        startTime: slot.startTime,
        endTime: slot.endTime,
        progress,
        nextProgram: nextProgram?.program
      };
    } catch (error) {
      console.error('Unexpected error fetching current program:', error);
      return null;
    }
  },

  /**
   * Gets the next scheduled program
   */
  async getNextProgram(afterTime: string, day: number): Promise<(TimeSlot & { program: Program }) | null> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('isActive', true)
        .contains('daysOfWeek', [day])
        .gt('startTime', afterTime)
        .order('startTime', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        // If no next program on same day, check first program of next day
        const nextDay = (day + 1) % 7;
        const nextDayResult = await supabase
          .from('time_slots')
          .select(`
            *,
            program:programs(*)
          `)
          .eq('isActive', true)
          .contains('daysOfWeek', [nextDay])
          .order('startTime', { ascending: true })
          .limit(1)
          .single();

        if (nextDayResult.error || !nextDayResult.data) {
          return null;
        }

        return nextDayResult.data as unknown as TimeSlot & { program: Program };
      }

      return data as unknown as TimeSlot & { program: Program };
    } catch (error) {
      console.error('Error fetching next program:', error);
      return null;
    }
  },

  /**
   * Creates a new time slot in the schedule
   */
  async createTimeSlot(timeSlot: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeSlot | null> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .insert({
          ...timeSlot,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating time slot:', error);
        return null;
      }

      return data as unknown as TimeSlot;
    } catch (error) {
      console.error('Unexpected error creating time slot:', error);
      return null;
    }
  },

  /**
   * Updates an existing time slot
   */
  async updateTimeSlot(id: string, updates: Partial<Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TimeSlot | null> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .update({
          ...updates,
          updatedAt: new Date()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating time slot:', error);
        return null;
      }

      return data as unknown as TimeSlot;
    } catch (error) {
      console.error('Unexpected error updating time slot:', error);
      return null;
    }
  },

  /**
   * Creates a new program
   */
  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program | null> {
    try {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          ...program,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating program:', error);
        return null;
      }

      return data as unknown as Program;
    } catch (error) {
      console.error('Unexpected error creating program:', error);
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
