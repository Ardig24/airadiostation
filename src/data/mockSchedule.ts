import { TimeSlot, Program, CurrentProgram } from '../types/schedule';

// Mock DJ profiles
export const mockDjs = [
  {
    id: 'dj1',
    name: 'DJ ByteBeat',
    imageUrl: 'https://picsum.photos/seed/dj1/200',
    bio: 'Your energetic morning host bringing you the latest hits and high energy to start your day!'
  },
  {
    id: 'dj2',
    name: 'DJ Synthia',
    imageUrl: 'https://picsum.photos/seed/dj2/200',
    bio: 'Electronic music specialist who knows how to keep the afternoon vibes flowing.'
  },
  {
    id: 'dj3',
    name: 'DJ NightOwl',
    imageUrl: 'https://picsum.photos/seed/dj3/200',
    bio: 'Your companion through the late hours with smooth tracks and chill beats.'
  },
  {
    id: 'dj4',
    name: 'DJ RockStar',
    imageUrl: 'https://picsum.photos/seed/dj4/200',
    bio: 'Classic and modern rock expert to fuel your evening commute.'
  },
  {
    id: 'dj5',
    name: 'DJ NewsFlash',
    imageUrl: 'https://picsum.photos/seed/dj5/200',
    bio: 'Keeping you informed with the latest news, weather, and traffic updates.'
  }
];

// Mock programs
export const mockPrograms: Program[] = [
  {
    id: 'prog1',
    type: 'music',
    title: 'Morning Beats',
    description: 'Start your day with energetic hits and positive vibes!',
    hostDjId: 'dj1',
    backgroundColor: '#8b5cf6',
    accentColor: '#c4b5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog2',
    type: 'news',
    title: 'Morning Briefing',
    description: 'Catch up on the latest news, weather, and traffic as you start your day.',
    hostDjId: 'dj5',
    backgroundColor: '#3b82f6',
    accentColor: '#93c5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog3',
    type: 'music',
    title: 'Midday Mix',
    description: 'A blend of current hits and recent favorites to power you through lunch.',
    hostDjId: 'dj2',
    backgroundColor: '#8b5cf6',
    accentColor: '#c4b5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog4',
    type: 'requests',
    title: 'Listener Requests',
    description: 'You ask, we play! Call in or message us with your favorite tracks.',
    hostDjId: 'dj1',
    backgroundColor: '#eab308',
    accentColor: '#fde68a',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog5',
    type: 'music',
    title: 'Afternoon Drive',
    description: 'High-energy tracks to keep you moving during your commute.',
    hostDjId: 'dj4',
    backgroundColor: '#8b5cf6',
    accentColor: '#c4b5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog6',
    type: 'news',
    title: 'Evening Update',
    description: 'Catch up on the day\'s events with our comprehensive news roundup.',
    hostDjId: 'dj5',
    backgroundColor: '#3b82f6',
    accentColor: '#93c5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog7',
    type: 'music',
    title: 'Electronic Sessions',
    description: 'The best in electronic, house, and dance music to energize your evening.',
    hostDjId: 'dj2',
    backgroundColor: '#8b5cf6',
    accentColor: '#c4b5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog8',
    type: 'interview',
    title: 'Artist Spotlight',
    description: 'In-depth interviews with musicians and artists making waves in the industry.',
    hostDjId: 'dj4',
    backgroundColor: '#ec4899',
    accentColor: '#fbcfe8',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog9',
    type: 'music',
    title: 'Late Night Vibes',
    description: 'Smooth and relaxing tracks to wind down your day.',
    hostDjId: 'dj3',
    backgroundColor: '#8b5cf6',
    accentColor: '#c4b5fd',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prog10',
    type: 'podcast',
    title: 'Tech Talk',
    description: 'The latest in technology news, trends, and discussions.',
    hostDjId: 'dj1',
    backgroundColor: '#10b981',
    accentColor: '#a7f3d0',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock time slots for a full week schedule
export const mockTimeSlots: TimeSlot[] = [
  // Weekday Morning Schedule (Monday-Friday)
  {
    id: 'slot1',
    startTime: '06:00',
    endTime: '09:00',
    programType: 'music',
    title: 'Morning Beats',
    description: 'Start your day with energetic hits and positive vibes!',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot2',
    startTime: '09:00',
    endTime: '10:00',
    programType: 'news',
    title: 'Morning Briefing',
    description: 'Catch up on the latest news, weather, and traffic as you start your day.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot3',
    startTime: '10:00',
    endTime: '12:00',
    programType: 'music',
    title: 'Midday Mix',
    description: 'A blend of current hits and recent favorites to power you through lunch.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot4',
    startTime: '12:00',
    endTime: '14:00',
    programType: 'requests',
    title: 'Listener Requests',
    description: 'You ask, we play! Call in or message us with your favorite tracks.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot5',
    startTime: '14:00',
    endTime: '16:00',
    programType: 'music',
    title: 'Afternoon Sessions',
    description: 'Keep the energy going with a mix of genres to suit everyone.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot6',
    startTime: '16:00',
    endTime: '19:00',
    programType: 'music',
    title: 'Afternoon Drive',
    description: 'High-energy tracks to keep you moving during your commute.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot7',
    startTime: '19:00',
    endTime: '20:00',
    programType: 'news',
    title: 'Evening Update',
    description: 'Catch up on the day\'s events with our comprehensive news roundup.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot8',
    startTime: '20:00',
    endTime: '22:00',
    programType: 'music',
    title: 'Electronic Sessions',
    description: 'The best in electronic, house, and dance music to energize your evening.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot9',
    startTime: '22:00',
    endTime: '00:00',
    programType: 'music',
    title: 'Late Night Vibes',
    description: 'Smooth and relaxing tracks to wind down your day.',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Weekend Schedule (Saturday)
  {
    id: 'slot10',
    startTime: '08:00',
    endTime: '10:00',
    programType: 'music',
    title: 'Weekend Warmup',
    description: 'Ease into your weekend with feel-good tracks and positive energy.',
    daysOfWeek: [6], // Saturday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot11',
    startTime: '10:00',
    endTime: '12:00',
    programType: 'podcast',
    title: 'Tech Talk',
    description: 'The latest in technology news, trends, and discussions.',
    daysOfWeek: [6], // Saturday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot12',
    startTime: '12:00',
    endTime: '15:00',
    programType: 'music',
    title: 'Saturday Anthems',
    description: 'The biggest hits to soundtrack your Saturday activities.',
    daysOfWeek: [6], // Saturday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot13',
    startTime: '15:00',
    endTime: '17:00',
    programType: 'requests',
    title: 'Weekend Requests',
    description: 'Your chance to hear your favorite tracks on the weekend.',
    daysOfWeek: [6], // Saturday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot14',
    startTime: '17:00',
    endTime: '19:00',
    programType: 'interview',
    title: 'Artist Spotlight',
    description: 'In-depth interviews with musicians and artists making waves in the industry.',
    daysOfWeek: [6], // Saturday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot15',
    startTime: '19:00',
    endTime: '00:00',
    programType: 'music',
    title: 'Saturday Night Party',
    description: 'The ultimate party mix to get your Saturday night going.',
    daysOfWeek: [6], // Saturday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Weekend Schedule (Sunday)
  {
    id: 'slot16',
    startTime: '08:00',
    endTime: '11:00',
    programType: 'music',
    title: 'Sunday Chill',
    description: 'Relaxing tracks to ease you into Sunday.',
    daysOfWeek: [0], // Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot17',
    startTime: '11:00',
    endTime: '13:00',
    programType: 'news',
    title: 'Week in Review',
    description: 'A recap of the week\'s biggest news stories and events.',
    daysOfWeek: [0], // Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot18',
    startTime: '13:00',
    endTime: '16:00',
    programType: 'music',
    title: 'Sunday Sessions',
    description: 'A mix of relaxing and uplifting tracks for your Sunday afternoon.',
    daysOfWeek: [0], // Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot19',
    startTime: '16:00',
    endTime: '18:00',
    programType: 'podcast',
    title: 'Culture Club',
    description: 'Discussions on the latest in arts, culture, and entertainment.',
    daysOfWeek: [0], // Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot20',
    startTime: '18:00',
    endTime: '20:00',
    programType: 'music',
    title: 'Acoustic Evening',
    description: 'Stripped-back versions and acoustic performances of popular songs.',
    daysOfWeek: [0], // Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'slot21',
    startTime: '20:00',
    endTime: '00:00',
    programType: 'music',
    title: 'Sunday Night Wind-Down',
    description: 'Relaxing tracks to help you unwind before the new week begins.',
    daysOfWeek: [0], // Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to map time slots to programs
export const mapSlotToProgram = (slot: TimeSlot): Program => {
  // Find the corresponding program based on the slot's title
  const program = mockPrograms.find(p => p.title === slot.title);
  
  // If no matching program is found, create a default one based on the slot
  if (!program) {
    return {
      id: `generated-${slot.id}`,
      type: slot.programType,
      title: slot.title,
      description: slot.description,
      hostDjId: 'dj1', // Default DJ
      backgroundColor: '#8b5cf6',
      accentColor: '#c4b5fd',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  return program;
};

// Helper function to get the current program based on the current time
export const getCurrentMockProgram = (): CurrentProgram | null => {
  // Get current time in HH:MM format
  const now = new Date('2025-03-29T09:35:57+01:00'); // Use the provided time
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay(); // 0-6 representing Sunday-Saturday
  
  console.log('Current time:', currentTime);
  console.log('Current day:', currentDay);
  
  // Find the current time slot
  const currentSlot = mockTimeSlots.find(slot => {
    const isInDay = slot.daysOfWeek.includes(currentDay);
    const isAfterStart = slot.startTime <= currentTime;
    const isBeforeEnd = slot.endTime >= currentTime;
    
    console.log(`Checking slot ${slot.title}:`, { 
      day: slot.daysOfWeek, 
      start: slot.startTime, 
      end: slot.endTime,
      isInDay,
      isAfterStart,
      isBeforeEnd,
      matches: isInDay && isAfterStart && isBeforeEnd
    });
    
    return (
      isInDay && isAfterStart && isBeforeEnd
    );
  });
  
  console.log('Found current slot:', currentSlot ? currentSlot.title : 'none');
  
  if (!currentSlot) {
    // If no exact match, find the closest upcoming slot for today
    console.log('No current slot found, looking for upcoming slot');
    const upcomingSlots = mockTimeSlots.filter(slot => 
      slot.daysOfWeek.includes(currentDay) && slot.startTime > currentTime
    );
    
    if (upcomingSlots.length > 0) {
      // Sort by start time and get the next one
      upcomingSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextSlot = upcomingSlots[0];
      console.log('Found upcoming slot:', nextSlot.title);
      
      // Create a program that shows it's upcoming
      const program = mapSlotToProgram(nextSlot);
      
      return {
        ...program,
        startTime: nextSlot.startTime,
        endTime: nextSlot.endTime,
        progress: 0, // 0% progress since it hasn't started
        nextProgram: undefined
      };
    }
    
    // If no upcoming slots today, show the first slot of tomorrow
    console.log('No upcoming slots today, looking for tomorrow');
    const tomorrowDay = (currentDay + 1) % 7;
    const tomorrowSlots = mockTimeSlots.filter(slot => 
      slot.daysOfWeek.includes(tomorrowDay)
    );
    
    if (tomorrowSlots.length > 0) {
      // Sort by start time and get the first one
      tomorrowSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const tomorrowSlot = tomorrowSlots[0];
      console.log('Found tomorrow slot:', tomorrowSlot.title);
      
      // Create a program that shows it's upcoming tomorrow
      const program = mapSlotToProgram(tomorrowSlot);
      
      return {
        ...program,
        startTime: tomorrowSlot.startTime,
        endTime: tomorrowSlot.endTime,
        progress: 0, // 0% progress since it hasn't started
        nextProgram: undefined
      };
    }
    
    // If all else fails, return a default program
    console.log('No matching slots found, returning default program');
    return {
      id: 'default-program',
      type: 'music',
      title: 'Weekend Mix',
      description: 'A mix of the best tracks to enjoy your weekend!',
      hostDjId: 'dj1',
      backgroundColor: '#8b5cf6',
      accentColor: '#c4b5fd',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: '09:00',
      endTime: '12:00',
      progress: 25,
      nextProgram: {
        id: 'next-default',
        type: 'music',
        title: 'Afternoon Vibes',
        description: 'Relaxing tunes for your afternoon',
        hostDjId: 'dj2',
        backgroundColor: '#8b5cf6',
        accentColor: '#c4b5fd',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }
  
  // Find the corresponding program
  const program = mapSlotToProgram(currentSlot);
  
  // Calculate progress percentage
  const startMinutes = timeToMinutes(currentSlot.startTime);
  const endMinutes = timeToMinutes(currentSlot.endTime);
  const currentMinutes = timeToMinutes(currentTime);
  const totalMinutes = endMinutes - startMinutes;
  const elapsedMinutes = currentMinutes - startMinutes;
  const progress = Math.round((elapsedMinutes / totalMinutes) * 100);
  
  // Find the next program
  const nextSlot = getNextTimeSlot(currentSlot.endTime, currentDay);
  const nextProgram = nextSlot ? mapSlotToProgram(nextSlot) : undefined;
  
  return {
    ...program,
    startTime: currentSlot.startTime,
    endTime: currentSlot.endTime,
    progress,
    nextProgram
  };
};

// Helper function to get the next time slot
const getNextTimeSlot = (afterTime: string, day: number): TimeSlot | null => {
  // Find slots for the current day that start after the given time
  let nextSlots = mockTimeSlots.filter(slot => {
    return slot.daysOfWeek.includes(day) && slot.startTime > afterTime;
  });
  
  // Sort by start time
  nextSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // If there's a next slot today, return it
  if (nextSlots.length > 0) {
    return nextSlots[0];
  }
  
  // Otherwise, find the first slot of the next day
  const nextDay = (day + 1) % 7;
  nextSlots = mockTimeSlots.filter(slot => slot.daysOfWeek.includes(nextDay));
  
  // Sort by start time
  nextSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  return nextSlots.length > 0 ? nextSlots[0] : null;
};

// Helper function to convert HH:MM time to minutes for calculations
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
