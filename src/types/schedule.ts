// Schedule types for the 24-hour radio station

export interface TimeSlot {
  id: string;
  startTime: string; // Format: 'HH:MM' in 24-hour format
  endTime: string; // Format: 'HH:MM' in 24-hour format
  programType: ProgramType;
  title: string;
  description: string;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProgramType = 
  | 'music' 
  | 'news' 
  | 'podcast' 
  | 'requests' 
  | 'weather' 
  | 'traffic' 
  | 'interview' 
  | 'spotlight' 
  | 'advertisement';

export interface Program {
  id: string;
  type: ProgramType;
  title: string;
  description: string;
  hostDjId: string; // Reference to a specific DJ personality
  imageUrl?: string;
  backgroundColor?: string; // For UI theming
  accentColor?: string; // For UI theming
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleDay {
  day: number; // 0-6 representing Sunday-Saturday
  slots: TimeSlot[];
}

export interface WeeklySchedule {
  days: ScheduleDay[];
}

// For the current program display
export interface CurrentProgram extends Program {
  startTime: string;
  endTime: string;
  progress: number; // 0-100 representing percentage complete
  nextProgram?: Program;
}
