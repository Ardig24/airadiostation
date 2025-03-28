import React, { useEffect, useState } from 'react';
import { weatherService, WeatherForecast } from '../services/weatherService';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle } from 'lucide-react';

interface WeatherUpdateProps {
  className?: string;
  location?: string;
  compact?: boolean;
}

const WeatherUpdate: React.FC<WeatherUpdateProps> = ({ 
  className = '', 
  location = 'London', 
  compact = false 
}) => {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const weatherData = await weatherService.getCurrentWeather(location);
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Failed to load weather information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Update weather every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [location]);

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return <Cloud className="h-6 w-6 text-gray-400" />;
    } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="h-6 w-6 text-yellow-400" />;
    } else {
      return <Cloud className="h-6 w-6 text-gray-400" />;
    }
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

  if (!weather) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <p className="text-gray-400">No weather information available</p>
      </div>
    );
  }

  // Compact view for sidebar or smaller spaces
  if (compact) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{weather.location}</h3>
            <p className="text-3xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
            <p className="text-gray-400">{weather.condition}</p>
          </div>
          <div className="text-right">
            {getWeatherIcon(weather.condition)}
            <div className="flex items-center mt-2 text-gray-400 text-sm">
              <Droplets className="h-4 w-4 mr-1" />
              <span>{weather.humidity}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full view with forecast
  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Weather Update</h3>
      
      {/* Current Weather */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-xl font-bold text-white">{weather.location}</h4>
          <p className="text-4xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
          <p className="text-gray-300">{weather.condition}</p>
        </div>
        <div className="text-right">
          {getWeatherIcon(weather.condition)}
          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-center justify-end text-gray-300">
              <Droplets className="h-4 w-4 mr-1" />
              <span>{weather.humidity}% humidity</span>
            </div>
            <div className="flex items-center justify-end text-gray-300">
              <Wind className="h-4 w-4 mr-1" />
              <span>{Math.round(weather.windSpeed)} km/h {weather.windDirection}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3-Day Forecast */}
      <div className="grid grid-cols-3 gap-2">
        {weather.forecast.map((day, index) => (
          <div key={day.date} className="bg-white/5 rounded p-3 text-center">
            <p className="text-gray-300 text-sm mb-1">
              {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            <div className="flex justify-center my-2">
              {getWeatherIcon(day.condition)}
            </div>
            <p className="text-white font-medium">{Math.round(day.maxTemp)}°C</p>
            <p className="text-gray-400 text-sm">{Math.round(day.minTemp)}°C</p>
            <div className="flex items-center justify-center mt-1 text-blue-400 text-xs">
              <Droplets className="h-3 w-3 mr-1" />
              <span>{day.chanceOfRain}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherUpdate;
