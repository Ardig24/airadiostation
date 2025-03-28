import React, { useEffect, useState } from 'react';
import { Advertisement, advertisementService } from '../services/advertisementService';
import { Volume2, VolumeX, ExternalLink } from 'lucide-react';

interface AdvertisementPlayerProps {
  className?: string;
  onComplete?: () => void;
}

const AdvertisementPlayer: React.FC<AdvertisementPlayerProps> = ({ 
  className, 
  onComplete
}) => {
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchRandomAd = async () => {
      try {
        setLoading(true);
        const ad = await advertisementService.getRandomAdvertisement();
        setCurrentAd(ad);
        setError(null);
      } catch (err) {
        console.error('Error fetching advertisement:', err);
        setError('Failed to load advertisement');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomAd();
  }, []);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    if (isPlaying && currentAd) {
      progressInterval = setInterval(() => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          const duration = audioRef.current.duration || currentAd.duration;
          const calculatedProgress = Math.round((currentTime / duration) * 100);
          setProgress(calculatedProgress);

          if (calculatedProgress >= 100) {
            clearInterval(progressInterval as NodeJS.Timeout);
            setIsPlaying(false);
            if (onComplete) onComplete();
          }
        }
      }, 1000);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isPlaying, currentAd, onComplete]);

  const playAd = () => {
    if (audioRef.current && currentAd) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing ad audio:', err);
          // If audio fails, we'll simulate progress for text-only ads
          simulateProgress();
        });
    } else if (currentAd && !currentAd.audioUrl) {
      // For text-only ads, simulate progress
      simulateProgress();
    }
  };

  const simulateProgress = () => {
    setIsPlaying(true);
    const duration = currentAd?.duration || 30; // Default to 30 seconds
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 1;
      const calculatedProgress = Math.round((elapsed / duration) * 100);
      setProgress(calculatedProgress);

      if (calculatedProgress >= 100) {
        clearInterval(interval);
        setIsPlaying(false);
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const pauseAd = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
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

  if (!currentAd) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <p className="text-gray-400">No advertisements available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl h-full flex flex-col ${className}`}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded mr-2">AD</span>
          {currentAd.title}
        </h3>
      </div>
      
      {/* Advertisement Content */}
      <div className="mb-4 bg-white/5 rounded-lg p-4 relative overflow-y-auto flex-1 custom-scrollbar">
        <div 
          className="absolute top-0 left-0 h-1 bg-purple-600" 
          style={{ width: `${progress}%` }}
        ></div>
        
        {currentAd.imageUrl && (
          <div className="mb-3">
            <img 
              src={currentAd.imageUrl} 
              alt={currentAd.title} 
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
        
        <p className="text-gray-300 mb-3">{currentAd.content}</p>
        
        {/* Additional dummy content to demonstrate scrolling */}
        <div className="space-y-4 mt-6">
          <h4 className="text-white font-medium">More About This Offer</h4>
          <p className="text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
          
          <h4 className="text-white font-medium">Benefits</h4>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Premium quality and exceptional performance</li>
            <li>Exclusive offers for radio listeners</li>
            <li>Free shipping on all orders</li>
            <li>30-day money-back guarantee</li>
          </ul>
          
          <h4 className="text-white font-medium">Limited Time Offer</h4>
          <p className="text-gray-300">This special promotion is only available for a limited time. Don't miss out on this exclusive opportunity to get the best deal of the season.</p>
        </div>
        
        {currentAd.audioUrl && (
          <audio 
            ref={audioRef} 
            src={currentAd.audioUrl} 
            onEnded={() => {
              setIsPlaying(false);
              if (onComplete) onComplete();
            }}
            className="hidden"
          />
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={isPlaying ? pauseAd : playAd}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          {currentAd.audioUrl && (
            <button 
              onClick={toggleMute}
              className="p-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
        </div>
        
        <a 
          href="#" 
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center transition-colors"
        >
          Learn More <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
      
      <div className="text-right mt-2">
        <span className="text-gray-400 text-xs">Sponsored Content</span>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AdvertisementPlayer;
