import React, { useEffect, useState } from 'react';
import { trafficService, TrafficUpdate } from '../services/trafficService';
import { AlertTriangle, Car, Clock, MapPin } from 'lucide-react';

interface TrafficUpdateProps {
  className?: string;
  region?: string;
}

const TrafficUpdateComponent: React.FC<TrafficUpdateProps> = ({ 
  className = '', 
  region = 'London'
}) => {
  const [trafficUpdates, setTrafficUpdates] = useState<TrafficUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrafficUpdates = async () => {
      try {
        setLoading(true);
        const updates = await trafficService.getTrafficUpdates(region);
        setTrafficUpdates(updates);
        setError(null);
      } catch (err) {
        console.error('Error fetching traffic updates:', err);
        setError('Failed to load traffic information');
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficUpdates();
    
    // Update traffic every 10 minutes
    const intervalId = setInterval(fetchTrafficUpdates, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [region]);

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'severe':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
      default:
        return 'bg-green-600';
    }
  };

  // Format time
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
        <div className="flex items-center text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Car className="mr-2 h-5 w-5" />
          Traffic Updates
        </h3>
        <div className="flex items-center text-gray-400 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{region}</span>
        </div>
      </div>
      
      {trafficUpdates.length === 0 ? (
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-gray-300">Traffic is flowing smoothly</p>
          <p className="text-gray-400 text-sm mt-1">No incidents to report in {region}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {trafficUpdates.map(update => (
            <div 
              key={update.id} 
              className="bg-white/5 rounded-lg p-3 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${getSeverityColor(update.severity)}`}></div>
              <div className="pl-2">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{update.description}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(update.severity)} text-white ml-2`}>
                    {update.severity.charAt(0).toUpperCase() + update.severity.slice(1)}
                  </span>
                </div>
                
                {update.affectedRoutes.length > 0 && (
                  <p className="text-gray-300 text-sm mb-2">
                    Affected: {update.affectedRoutes.join(', ')}
                  </p>
                )}
                
                <div className="flex items-center text-gray-400 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTime(update.startTime)} - {formatTime(update.endTime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrafficUpdateComponent;
