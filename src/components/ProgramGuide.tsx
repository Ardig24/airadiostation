import React, { useEffect, useState } from 'react';
import { scheduleService } from '../services/scheduleService';
import { ScheduleDay, TimeSlot } from '../types/schedule';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface ProgramGuideProps {
  className?: string;
}

const ProgramGuide: React.FC<ProgramGuideProps> = ({ className }) => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const weeklySchedule = await scheduleService.getWeeklySchedule();
        if (weeklySchedule) {
          setSchedule(weeklySchedule.days);
          setError(null);
        } else {
          setError('Failed to load schedule');
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handlePreviousDay = () => {
    setSelectedDay((prev) => (prev === 0 ? 6 : prev - 1));
  };

  const handleNextDay = () => {
    setSelectedDay((prev) => (prev === 6 ? 0 : prev + 1));
  };

  // Format time from 24h to 12h format
  const formatTime = (time24h: string) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  // Get program type color
  const getProgramTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      music: 'bg-purple-600',
      news: 'bg-blue-600',
      podcast: 'bg-green-600',
      requests: 'bg-yellow-600',
      weather: 'bg-sky-600',
      traffic: 'bg-orange-600',
      interview: 'bg-pink-600',
      spotlight: 'bg-indigo-600',
      advertisement: 'bg-gray-600'
    };
    
    return colors[type] || 'bg-gray-600';
  };

  // Check if a time slot is currently active
  const isCurrentTimeSlot = (slot: TimeSlot) => {
    const now = new Date();
    const currentDay = now.getDay();
    
    if (currentDay !== selectedDay) return false;
    
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return slot.startTime <= currentTime && slot.endTime >= currentTime;
  };

  // Get the selected day's schedule
  const selectedDaySchedule = schedule.find(day => day.day === selectedDay);

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-white/20 rounded w-1/2"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Program Guide
        </h3>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousDay}
            className="p-1 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="text-white font-medium">{dayNames[selectedDay]}</span>
          
          <button 
            onClick={handleNextDay}
            className="p-1 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {selectedDaySchedule && selectedDaySchedule.slots.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {selectedDaySchedule.slots
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((slot) => (
              <div 
                key={slot.id} 
                className={`p-3 rounded-lg transition-colors ${isCurrentTimeSlot(slot) ? 'bg-white/20' : 'bg-white/5'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-md font-semibold text-white">{slot.title}</h4>
                  <span className="text-sm text-gray-300 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-2">{slot.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs ${getProgramTypeColor(slot.programType)} text-white`}>
                    {slot.programType.charAt(0).toUpperCase() + slot.programType.slice(1)}
                  </span>
                  
                  {isCurrentTimeSlot(slot) && (
                    <span className="text-xs px-2 py-1 bg-green-600 rounded text-white">On Air</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No programs scheduled for {dayNames[selectedDay]}</p>
        </div>
      )}
    </div>
  );
};

export default ProgramGuide;
