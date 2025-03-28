/**
 * useAudioPlayer Hook
 * 
 * Custom hook for managing audio playback functionality
 * Separates audio logic from UI components
 */

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerOptions {
  streamUrl?: string;
  volume?: number;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const useAudioPlayer = (options: AudioPlayerOptions = {}) => {
  const {
    streamUrl = '',
    volume: initialVolume = 80,
    onEnded,
    autoPlay = false
  } = options;
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    if (!streamUrl) return;
    
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(streamUrl);
      } else {
        audioRef.current.src = streamUrl;
      }
      
      audioRef.current.volume = volume / 100;
      
      const handleCanPlay = () => {
        setIsLoading(false);
        setError(null);
        if (autoPlay) {
          audioRef.current?.play().catch(err => {
            console.error('Error auto-playing audio:', err);
            setIsPlaying(false);
          });
        }
      };
      
      const handleLoadError = () => {
        setError('Failed to load audio. Please try again.');
        setIsLoading(false);
      };
      
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      };
      
      // Set up event listeners
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleLoadError);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
      
      // Start loading the audio
      audioRef.current.load();
      
      // Cleanup function
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleLoadError);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    } catch (err) {
      console.error('Error setting up audio:', err);
      setError('Failed to initialize audio player');
      setIsLoading(false);
    }
  }, [streamUrl, autoPlay, volume, onEnded]);
  
  // Play/pause control
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio. Please try again.');
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Mute/unmute control
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Volume control
  const handleVolumeChange = (newVolume: number) => {
    if (!audioRef.current) return;
    
    setVolume(newVolume);
    audioRef.current.volume = newVolume / 100;
    
    if (newVolume === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };
  
  // Seek control
  const handleSeek = (seekTime: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  return {
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    isLoading,
    error,
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleSeek
  };
};
