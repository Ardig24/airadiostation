import React, { useEffect, useState } from 'react';
import { scheduleService } from '../services/scheduleService';
import { CurrentProgram } from '../types/schedule';
import { Clock, Calendar, Radio } from 'lucide-react';

interface ProgramScheduleProps {
  className?: string;
}

const ProgramSchedule: React.FC<ProgramScheduleProps> = ({ className }) => {
  const [currentProgram, setCurrentProgram] = useState<CurrentProgram | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentProgram = async () => {
      try {
        setLoading(true);
        const program = await scheduleService.getCurrentProgram();
        setCurrentProgram(program);
        setError(null);
      } catch (err) {
        console.error('Error fetching current program:', err);
        setError('Failed to load current program');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProgram();
    
    // Update every minute to keep progress and current program accurate
    const intervalId = setInterval(fetchCurrentProgram, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

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

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-8 bg-white/20 rounded"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
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

  if (!currentProgram) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <p className="text-gray-400">No program currently scheduled</p>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Radio className="mr-2 h-5 w-5" />
          Now Playing
        </h3>
      </div>
      
      {/* Current Program */}
      <div className="mb-6 bg-white/5 rounded-lg p-4 relative overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-1 ${getProgramTypeColor(currentProgram.type)}`} 
          style={{ width: `${currentProgram.progress}%` }}
        ></div>
        
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-bold text-white">{currentProgram.title}</h4>
          <span className="text-sm text-gray-300 flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
          </span>
        </div>
        
        <p className="text-gray-300 mb-3">{currentProgram.description}</p>
        
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-xs ${getProgramTypeColor(currentProgram.type)} text-white`}>
            {currentProgram.type.charAt(0).toUpperCase() + currentProgram.type.slice(1)}
          </span>
          <span className="text-gray-400 text-sm">{currentProgram.progress}% complete</span>
        </div>
      </div>
      
      {/* Next Program */}
      {currentProgram.nextProgram && (
        <div>
          <h4 className="text-md font-semibold text-white flex items-center mb-2">
            <Calendar className="mr-2 h-4 w-4" />
            Up Next
          </h4>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <h5 className="text-md font-semibold text-white">{currentProgram.nextProgram.title}</h5>
            </div>
            <p className="text-gray-400 text-sm mb-2">{currentProgram.nextProgram.description}</p>
            <span className={`px-2 py-1 rounded text-xs ${getProgramTypeColor(currentProgram.nextProgram.type)} text-white`}>
              {currentProgram.nextProgram.type.charAt(0).toUpperCase() + currentProgram.nextProgram.type.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramSchedule;
