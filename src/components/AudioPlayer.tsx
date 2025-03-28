import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc, RefreshCw } from 'lucide-react';
import { useRadioStore } from '../store/radioStore';

interface AudioPlayerProps {
  currentTrack?: {
    title: string;
    artist: string;
    coverArt?: string;
  };
}

const AudioWaves = () => (
  <div className="flex gap-1 items-end h-12">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-emerald-400/60 rounded-full animate-pulse"
        style={{
          height: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  currentTrack = { title: 'AI Radio Stream', artist: 'AI DJ' }
}) => {
  const { 
    isPlaying, 
    isDjSpeaking,
    isAudioPlaying,
    currentTrack: storeTrack,
    togglePlayPause: storeTogglePlayPause,
    nextTrack 
  } = useRadioStore();
  
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Log the current state for debugging
  useEffect(() => {
    console.log('AudioPlayer state:', { 
      currentTrack: storeTrack, 
      isPlaying, 
      isDjSpeaking,
      audioElement: audioRef.current ? {
        src: audioRef.current.src,
        paused: audioRef.current.paused,
        readyState: audioRef.current.readyState,
        networkState: audioRef.current.networkState,
        error: audioRef.current.error
      } : 'not initialized'
    });
  }, [storeTrack, isPlaying, isDjSpeaking]);

  // Effect to handle track playback
  useEffect(() => {
    console.log('Track changed effect triggered, new track:', storeTrack);
    if (!storeTrack) {
      console.log('No track available');
      return;
    }
    
    console.log('Setting up audio for track:', storeTrack);
    
    // Create new audio element for the track
    const audio = new Audio();
    audio.volume = volume / 100;
    audio.muted = isMuted;
    
    // Set up event listeners
    audio.addEventListener('ended', () => {
      console.log('Track ended, moving to next track');
      // Reset the isAudioPlaying flag in the store
      useRadioStore.setState({ isAudioPlaying: false });
      nextTrack();
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio can play through without buffering');
      // If we're supposed to be playing, try to play
      if (isPlaying && !audio.paused && !isDjSpeaking) {
        console.log('Auto-playing after canplaythrough event');
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error auto-playing after canplaythrough:', error);
          });
        }
      }
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Error playing audio:', e);
      console.error('Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
        currentTime: audio.currentTime,
        paused: audio.paused,
        volume: audio.volume,
        muted: audio.muted
      });
      
      // Reset the isAudioPlaying flag in the store
      useRadioStore.setState({ isAudioPlaying: false });
      
      // Try to recover by moving to the next track
      setTimeout(() => {
        console.log('Attempting to recover by moving to next track');
        nextTrack();
      }, 2000);
    });
    
    // Add more detailed logging for debugging
    audio.addEventListener('loadstart', () => console.log('Audio loadstart event'));
    audio.addEventListener('progress', () => console.log('Audio progress event'));
    audio.addEventListener('loadedmetadata', () => console.log('Audio loadedmetadata event'));
    audio.addEventListener('loadeddata', () => console.log('Audio loadeddata event'));
    audio.addEventListener('canplay', () => console.log('Audio canplay event'));
    audio.addEventListener('play', () => console.log('Audio play event'));
    audio.addEventListener('playing', () => console.log('Audio playing event'));
    audio.addEventListener('pause', () => console.log('Audio pause event'));
    
    // Try to get the audio URL from either file_url or audioUrl property
    const audioSource = storeTrack.file_url || storeTrack.audioUrl;
    
    if (!audioSource) {
      console.error('No audio source available for track:', storeTrack);
      return;
    }
    
    // For testing, always use the Mixkit URL directly
    console.log('Original audio source:', audioSource);
    
    // Check if we have a valid Mixkit URL
    if (!audioSource.includes('mixkit.co')) {
      console.warn('Not using a Mixkit URL, this might cause issues');
    }
    
    // Use the URL directly if it's a full URL, otherwise prepend the base URL
    const fullUrl = audioSource.startsWith('http') 
      ? audioSource 
      : `${window.location.origin}${audioSource}`;
    
    console.log('Loading audio from URL:', fullUrl);
    
    // Set the source and load the audio
    audio.src = fullUrl;
    audio.load();
    
    // Store the audio element
    audioRef.current = audio;
    
    // Cleanup
    return () => {
      console.log('Cleaning up audio element');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
      }
    };
  }, [storeTrack, volume, isMuted, nextTrack, isPlaying, isDjSpeaking]);
  
  // Effect to handle play/pause state
  useEffect(() => {
    console.log('Play/pause state changed, isPlaying:', isPlaying, 'isDjSpeaking:', isDjSpeaking);
    if (!audioRef.current) {
      console.log('No audio element available');
      return;
    }
    
    // Don't play music if DJ is speaking or if another audio is already playing
    if (isDjSpeaking || (isAudioPlaying && !audioRef.current.src)) {
      console.log('DJ is speaking or another audio is playing, not playing music');
      return;
    }
    
    if (isPlaying) {
      console.log('Attempting to play audio');
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          console.error('This is likely due to browser autoplay restrictions');
          console.log('Setting store isPlaying to false due to autoplay restriction');
          // Update the store to reflect that we're not playing
          useRadioStore.setState({ isPlaying: false });
        });
      }
    } else {
      console.log('Pausing audio');
      audioRef.current.pause();
    }
  }, [isPlaying, isDjSpeaking, isAudioPlaying]);
  
  // Handle volume changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };
  
  // Handle play button click
  const handlePlayClick = () => {
    console.log('Play button clicked');
    if (!isPlaying) {
      // If not playing, start the flow with the current or first track
      nextTrack();
    } else {
      // If playing, just toggle pause
      storeTogglePlayPause();
    }
  };
  
  const displayTrack = storeTrack || currentTrack;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-emerald-400/20 rounded-lg flex items-center justify-center">
          <div className="text-emerald-400">
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">Now Playing</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          {isPlaying && !isDjSpeaking ? <AudioWaves /> : <div className="h-12" />}
        </div>
        
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-400/20 rounded-lg flex items-center justify-center overflow-hidden">
              {displayTrack.coverArt ? (
                <img 
                  src={displayTrack.coverArt} 
                  alt={displayTrack.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-emerald-400">
                  <Disc size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-white font-semibold truncate">{displayTrack.title}</h3>
              <p className="text-emerald-400 truncate">{displayTrack.artist}</p>
              {isDjSpeaking && (
                <div className="flex items-center gap-2 mt-1">
                  <RefreshCw size={14} className="text-white/60 animate-spin" />
                  <span className="text-white/60 text-xs">DJ Speaking...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className="text-white hover:text-emerald-400 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #34d399 0%, #34d399 ${volume}%, rgba(255, 255, 255, 0.2) ${volume}%, rgba(255, 255, 255, 0.2) 100%)`
              }}
            />
          </div>
          
          <div className="flex gap-4 justify-center w-full">
            <button 
              onClick={handlePlayClick}
              className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;