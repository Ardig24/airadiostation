import React, { useEffect, useState } from 'react';
import { Radio, Headphones } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import UserInteraction from './UserInteraction';
import ContentDisplay from './ContentDisplay';
import StationInfo from './StationInfo';
import DjCard from './DjCard';
import AudioWaves from './AudioWaves';
import ProgramSchedule from './ProgramSchedule';
import WeatherUpdate from './WeatherUpdate';
import TrafficUpdate from './TrafficUpdate';
import NewsBulletin from './NewsBulletin';
import AdvertisementPlayer from './AdvertisementPlayer';
import { useRadioStore } from '../store/radioStore';
import { ContentItem } from '../types';
import { supabase } from '../lib/supabaseClient';

const RadioStation: React.FC = () => {
  const { 
    initialize, 
    currentTrack, 
    contentItems,
    queue,
    currentPlaylist,
    currentVoiceProfile,
    isDjSpeaking,
    listenerCount,
    isPlaying,
    isLoading,
    error,
    togglePlayPause
  } = useRadioStore();
  
  const [showAds, setShowAds] = useState<boolean>(true);
  const [showWeather, setShowWeather] = useState<boolean>(false);
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showNews, setShowNews] = useState<boolean>(false);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<string>('Checking database connection...');

  // Handle ad completion
  const handleAdComplete = () => {
    console.log('Advertisement completed');
    // Hide the ad after completion
    setShowAds(false);
    
    // Show ads again after 5 minutes
    setTimeout(() => setShowAds(true), 5 * 60 * 1000);
  };

  // Simulate a DJ talking effect
  useEffect(() => {
    // Every 3 minutes, show an ad
    const adInterval = setInterval(() => {
      setShowAds(true);
    }, 3 * 60 * 1000);

    // Show weather updates periodically
    const weatherInterval = setInterval(() => {
      setShowWeather(true);
      // Hide weather after 2 minutes
      setTimeout(() => setShowWeather(false), 2 * 60 * 1000);
    }, 15 * 60 * 1000); // Every 15 minutes

    // Show traffic updates during commute hours
    const checkTrafficTime = () => {
      const now = new Date();
      const hour = now.getHours();
      // Show traffic during morning (7-9 AM) and evening (4-7 PM) commute
      const isCommuteHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
      
      if (isCommuteHour) {
        setShowTraffic(true);
        // Hide traffic after 3 minutes
        setTimeout(() => setShowTraffic(false), 3 * 60 * 1000);
      }
    };

    // Show news updates at specific times
    const checkNewsTime = () => {
      const now = new Date();
      const minute = now.getMinutes();
      
      // Show news at the top of each hour (for 5 minutes)
      if (minute < 5) {
        setShowNews(true);
        // Hide news after 5 minutes
        setTimeout(() => setShowNews(false), 5 * 60 * 1000);
      }
    };

    // Check traffic initially and then every 20 minutes
    checkTrafficTime();
    const trafficInterval = setInterval(checkTrafficTime, 20 * 60 * 1000);
    
    // Check news initially and then every 30 minutes
    checkNewsTime();
    const newsInterval = setInterval(checkNewsTime, 30 * 60 * 1000);

    return () => {
      clearInterval(adInterval);
      clearInterval(weatherInterval);
      clearInterval(trafficInterval);
      clearInterval(newsInterval);
    };
  }, []);

  // Initialize the radio station on component mount and start playing automatically
  useEffect(() => {
    const initializeRadio = async () => {
      console.log('Initializing radio station...');
      try {
        await initialize();
        console.log('Radio station initialized successfully');
        
        // Check if we have tracks in the queue
        const currentState = useRadioStore.getState();
        console.log('Current radio state after initialization:', {
          queueLength: currentState.queue.length,
          currentTrack: currentState.currentTrack,
          isPlaying: currentState.isPlaying,
          isDjSpeaking: currentState.isDjSpeaking
        });
        
        // Don't auto-play - let user click the play button
        // This is more reliable and avoids autoplay restrictions
        console.log('Radio station initialized, waiting for user to press play');
      } catch (error) {
        console.error('Error initializing radio station:', error);
      }
    };
    
    initializeRadio();
  }, [initialize]);

  // Test Supabase connection
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('tracks').select('id');
        if (error) {
          setDbConnectionStatus('Error connecting to database: ' + error.message);
          console.log('Database connection error:', error);
        } else {
          setDbConnectionStatus(`Database connection established (${data.length} tracks found)`);
          console.log('Database connection successful, tracks found:', data);
        }
      } catch (error: any) {
        setDbConnectionStatus('Error connecting to database: ' + (error.message || String(error)));
        console.error('Exception when connecting to database:', error);
      }
    };
    testSupabaseConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Headphones className="w-12 h-12 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-white text-2xl font-bold mb-2">Loading AI Radio Station</div>
          <div className="text-emerald-400">Tuning in to the perfect frequency...</div>
          <div className="mt-6">
            <AudioWaves />
          </div>
          <div className="text-white mt-4">{dbConnectionStatus}</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Radio className="w-12 h-12 text-red-400" />
          </div>
          <div className="text-white text-2xl font-bold mb-2">Connection Error</div>
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={() => initialize()}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            Try Again
          </button>
          <div className="text-white mt-4">{dbConnectionStatus}</div>
        </div>
      </div>
    );
  }
  
  // Mock data for development when Supabase connection fails
  const mockContentItems: ContentItem[] = [
    {
      id: '1',
      type: 'announcement',
      content: 'Welcome to AI Radio! I\'m your AI DJ and I\'ll be playing some great tunes for you today.',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'track',
      content: 'Now playing a smooth electronic track with ambient vibes.',
      title: 'Synthetic Dreams',
      artist: 'AI Composer',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '3',
      type: 'message',
      content: 'Can you play something more upbeat?',
      timestamp: new Date(Date.now() - 240000)
    }
  ];
  
  const mockTrack = {
    id: '1',
    title: 'Synthetic Dreams',
    artist: 'AI Composer',
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
    duration: 215,
    file_url: 'https://assets.mixkit.co/music/download/mixkit-tech-house-vibes-130.mp3' // Added file_url for direct streaming
  };
  
  // Use real data if available, otherwise use mock data
  const displayContentItems = contentItems.length > 0 ? contentItems : mockContentItems;
  const displayTrack = currentTrack || mockTrack;
  const displayQueue = queue.length > 0 ? queue : [mockTrack];
  
  return (
    <div 
      className="min-h-screen py-10 px-4 md:px-8 overflow-x-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">AI Radio Station</h1>
          <p className="text-emerald-300 text-xl">
            {currentPlaylist?.name || 'Your 24/7 AI-Powered Music Experience'}
          </p>
          <div className="text-white mt-4">{dbConnectionStatus}</div>
          {/* Display current playback status */}
          <div className="text-white/70 mt-2">
            Status: {isPlaying ? 'On Air' : 'Standby'}
          </div>
          
          {/* Add prominent Start Radio button */}
          {!isPlaying && (
            <div className="mt-6">
              <button 
                onClick={() => {
                  console.log('Start Radio button clicked');
                  togglePlayPause();
                }}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold rounded-full transition-colors shadow-lg animate-pulse"
              >
                Start Radio
              </button>
              <p className="text-white/70 mt-2 text-sm">
                Click to enable audio playback
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column */}
          <div className="col-span-1 space-y-8">
            <DjCard 
              currentVoiceProfile={currentVoiceProfile} 
              isDjSpeaking={isDjSpeaking} 
            />
            
            <ProgramSchedule />
            
            {/* Advertisement Section moved under program schedule */}
            {showAds && (
              <div className="h-[600px]">
                <AdvertisementPlayer 
                  onComplete={handleAdComplete}
                />
              </div>
            )}
          </div>

          {/* Middle Column */}
          <div className="col-span-1 space-y-8">
            <AudioPlayer 
              currentTrack={displayTrack ? {
                title: displayTrack.title,
                artist: displayTrack.artist,
                coverArt: displayTrack.coverArt
              } : undefined}
            />
            
            {/* Traffic Update moved under audio player */}
            {showTraffic && (
              <TrafficUpdate />
            )}
          </div>
          
          {/* Right Column */}
          <div className="col-span-1 space-y-4">
            <UserInteraction />
            <ContentDisplay contentItems={displayContentItems} />
          </div>
        </div>

        {/* Stats Section moved right after main grid */}
        <div className="mt-8">
          <StationInfo 
            listenerCount={listenerCount || 2547}
            queueLength={displayQueue.length}
            currentVoiceProfile={currentVoiceProfile}
            currentPlaylist={currentPlaylist}
          />
        </div>

        {/* Dynamic Content Section - Using a grid for better organization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Weather Update - Conditional */}
          {showWeather && (
            <div className="col-span-1">
              <WeatherUpdate compact />
            </div>
          )}

          {/* News Bulletin - Conditional */}
          {showNews && (
            <div className="col-span-1 md:col-span-2">
              <NewsBulletin />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadioStation;
