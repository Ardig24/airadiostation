import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import UserInteraction from './UserInteraction';
import ContentDisplay from './ContentDisplay';
import DjCard from './DjCard';
import ProgramSchedule from './ProgramSchedule';
import AdvertisementPlayer from './AdvertisementPlayer';
import StationInfo from './StationInfo';
import AudioWaves from './AudioWaves';
import WeatherUpdate from './WeatherUpdate';
import TrafficUpdate from './TrafficUpdate';
import NewsBulletin from './NewsBulletin';
import { useRadioStore } from '../store/radioStore';
import { supabase } from '../lib/supabaseClient';
import ChatDj from './ChatDj';
import TabNavigation from './TabNavigation';
import PodcastPage from './PodcastPage';
import NewsPage from './NewsPage';

const RadioStation: React.FC = () => {
  const { 
    initialize, 
    currentTrack, 
    contentItems,
    queue,
    currentPlaylist,
    currentVoiceProfile,
    isDjSpeaking,
    isChatResponse,
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
  const [activeTab, setActiveTab] = useState<string>('music');

  // Handle ad completion
  const handleAdComplete = () => {
    console.log('Advertisement completed');
    // Hide the ad after completion
    setShowAds(false);
    
    // Show ads again after 5 minutes
    setTimeout(() => setShowAds(true), 5 * 60 * 1000);
  };

  // Initialize the radio station
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check database connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('tracks').select('count', { count: 'exact' });
        if (error) throw error;
        setDbConnectionStatus(`Connected to database. ${data?.length || 0} tracks available.`);
      } catch (error) {
        console.error('Database connection error:', error);
        setDbConnectionStatus('Database connection failed. Using mock data.');
      }
    };

    checkConnection();
  }, []);

  // Show weather update every 30 minutes
  useEffect(() => {
    const showWeatherUpdate = () => {
      setShowWeather(true);
      // Hide after 2 minutes
      setTimeout(() => setShowWeather(false), 2 * 60 * 1000);
    };

    // Show initially after 5 minutes
    const initialTimeout = setTimeout(showWeatherUpdate, 5 * 60 * 1000);
    
    // Then show every 30 minutes
    const intervalId = setInterval(showWeatherUpdate, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);

  // Show traffic update during commute hours
  useEffect(() => {
    const checkTrafficTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const isCommute = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
      
      if (isCommute && !showTraffic) {
        setShowTraffic(true);
        // Hide after 3 minutes
        setTimeout(() => setShowTraffic(false), 3 * 60 * 1000);
      }
    };

    // Check every 15 minutes
    const intervalId = setInterval(checkTrafficTime, 15 * 60 * 1000);
    // Initial check
    checkTrafficTime();

    return () => clearInterval(intervalId);
  }, [showTraffic]);

  // Show news bulletin every hour
  useEffect(() => {
    const showNewsBulletin = () => {
      setShowNews(true);
      // Hide after 5 minutes
      setTimeout(() => setShowNews(false), 5 * 60 * 1000);
    };

    // Show initially after 15 minutes
    const initialTimeout = setTimeout(showNewsBulletin, 15 * 60 * 1000);
    
    // Then show every hour
    const intervalId = setInterval(showNewsBulletin, 60 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);

  // Prepare display data
  const displayTrack = currentTrack;
  const displayContentItems = contentItems.slice(0, 3);
  const displayQueue = queue.slice(0, 5);

  // Handle errors
  if (error) {
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
        <div className="relative z-10 max-w-6xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-xl text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="min-h-screen py-10 px-4 md:px-8 overflow-x-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Radio Station...</h2>
          <div className="w-64 h-16 mx-auto">
            <AudioWaves />
          </div>
        </div>
      </div>
    );
  }

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
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Station Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Radio className="h-8 w-8 mr-3 text-purple-400" />
            <h1 className="text-3xl font-bold">AI Radio Station</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm bg-white/10 px-3 py-1 rounded-full">
              {isPlaying ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Live
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Paused
                </span>
              )}
            </div>
            
            <button 
              onClick={togglePlayPause}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content - Conditionally render based on active tab */}
        {activeTab === 'music' ? (
          <>
            {/* DJ Card - Only show when DJ is speaking */}
            {isDjSpeaking && (
              <div className="mb-8">
                <DjCard 
                  currentVoiceProfile={currentVoiceProfile}
                  isDjSpeaking={isDjSpeaking}
                  isChatResponse={isChatResponse}
                />
              </div>
            )}
            
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="col-span-1 space-y-6">
                <AudioPlayer 
                  currentTrack={displayTrack ? {
                    title: displayTrack.title,
                    artist: displayTrack.artist,
                    coverArt: displayTrack.coverArt
                  } : undefined}
                />
                
                {showAds && (
                  <div className="h-[550px] overflow-hidden">
                    <AdvertisementPlayer onComplete={handleAdComplete} />
                  </div>
                )}
              </div>
              
              {/* Middle Column */}
              <div className="col-span-1 space-y-6">
                <ChatDj />
                {/* Song Request */}
                <UserInteraction />
                {/* Traffic Update */}
                {showTraffic && (
                  <TrafficUpdate />
                )}
                {showNews && (
                  <NewsBulletin />
                )}
              </div>
              
              {/* Right Column */}
              <div className="col-span-1 space-y-6">
                <ProgramSchedule />
                <div className="h-[400px] overflow-hidden">
                  <ContentDisplay contentItems={displayContentItems} />
                </div>
                {showWeather && (
                  <WeatherUpdate />
                )}
              </div>
            </div>
            
            {/* Station Info - Full Width at Bottom */}
            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <StationInfo 
                listenerCount={listenerCount}
                queueLength={displayQueue.length}
                currentVoiceProfile={currentVoiceProfile}
                currentPlaylist={currentPlaylist}
              />
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>&copy; {new Date().getFullYear()} AI Radio Station. All rights reserved.</p>
              <p className="mt-1">{dbConnectionStatus}</p>
            </div>
          </>
        ) : activeTab === 'podcast' ? (
          /* Podcast Page */
          <PodcastPage />
        ) : (
          /* News Page */
          <NewsPage />
        )}
      </div>
    </div>
  );
};

export default RadioStation;
