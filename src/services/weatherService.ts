import { supabase } from '../lib/supabaseClient';

export interface WeatherForecast {
  id: string;
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  forecast: WeatherCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface WeatherCondition {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  precipitation: number;
  chanceOfRain: number;
}

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

export const weatherService = {
  /**
   * Fetches current weather for a location
   */
  async getCurrentWeather(location: string): Promise<WeatherForecast | null> {
    try {
      // First check if we have a recent forecast in the database
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const { data: existingForecast } = await supabase
        .from('weather_forecasts')
        .select('*')
        .eq('location', location)
        .gt('updatedAt', oneHourAgo.toISOString())
        .order('updatedAt', { ascending: false })
        .limit(1)
        .single();
      
      if (existingForecast) {
        return existingForecast as WeatherForecast;
      }
      
      // If no recent forecast, fetch from API
      if (!WEATHER_API_KEY) {
        console.error('Weather API key not configured');
        return null;
      }
      
      const response = await fetch(
        `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      
      const weatherData = await response.json();
      
      // Transform API response to our format
      const forecast: WeatherForecast = {
        id: '', // Will be assigned by Supabase
        location: weatherData.location.name,
        temperature: weatherData.current.temp_c,
        condition: weatherData.current.condition.text,
        icon: weatherData.current.condition.icon,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.wind_kph,
        windDirection: weatherData.current.wind_dir,
        precipitation: weatherData.current.precip_mm,
        forecast: weatherData.forecast.forecastday.map((day: any) => ({
          date: day.date,
          maxTemp: day.day.maxtemp_c,
          minTemp: day.day.mintemp_c,
          condition: day.day.condition.text,
          icon: day.day.condition.icon,
          precipitation: day.day.totalprecip_mm,
          chanceOfRain: day.day.daily_chance_of_rain
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to database
      const { data: savedForecast, error } = await supabase
        .from('weather_forecasts')
        .insert(forecast)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving weather forecast:', error);
        return forecast; // Return the forecast even if saving failed
      }
      
      return savedForecast as WeatherForecast;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  },
  
  /**
   * Gets a weather forecast for a radio announcement
   */
  async getWeatherAnnouncement(location: string): Promise<string> {
    try {
      const weather = await this.getCurrentWeather(location);
      
      if (!weather) {
        return 'Weather information is currently unavailable.';
      }
      
      // Create a natural language weather announcement
      const timeOfDay = new Date().getHours() < 12 ? 'morning' : 
                       new Date().getHours() < 18 ? 'afternoon' : 'evening';
      
      const temperatureDescription = 
        weather.temperature < 5 ? 'very cold' :
        weather.temperature < 10 ? 'cold' :
        weather.temperature < 20 ? 'mild' :
        weather.temperature < 25 ? 'warm' :
        weather.temperature < 30 ? 'hot' : 'very hot';
      
      const rainDescription = 
        weather.precipitation > 0 ? `with ${weather.precipitation}mm of precipitation` : 'with no precipitation';
      
      const tomorrowForecast = weather.forecast[1];
      const tomorrowDescription = 
        `Tomorrow will be ${tomorrowForecast.condition.toLowerCase()} with temperatures between 
        ${Math.round(tomorrowForecast.minTemp)}°C and ${Math.round(tomorrowForecast.maxTemp)}°C. 
        There's a ${tomorrowForecast.chanceOfRain}% chance of rain.`;
      
      return `Good ${timeOfDay} listeners! Here's your weather update for ${weather.location}. 
      It's currently ${Math.round(weather.temperature)}°C and ${weather.condition.toLowerCase()}, 
      which feels ${temperatureDescription} ${rainDescription}. 
      Wind is blowing from the ${weather.windDirection} at ${Math.round(weather.windSpeed)} km/h. 
      ${tomorrowDescription} 
      That's your weather update for now, stay tuned for more updates throughout the day.`;
    } catch (error) {
      console.error('Error creating weather announcement:', error);
      return 'Weather information is currently unavailable.';
    }
  }
};
