import React, { useState, useEffect } from 'react';
import { Newspaper, Volume2, Pause, RefreshCw, Rss, ExternalLink, Radio, SkipForward, AlertTriangle } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import { podcastVoiceService } from '../services/podcastVoiceService';
import { rssService } from '../services/rssService';
import AudioWaves from './AudioWaves';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  publishDate: string;
  summary: string;
  content: string;
  imageUrl?: string;
}

const NewsPage: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState<number>(-1);
  const [activeSpeaker, setActiveSpeaker] = useState<string>('News Anchor');
  const [continuousPlay, setContinuousPlay] = useState<boolean>(false);
  const [newsIntro, setNewsIntro] = useState<string>('');
  
  // Fetch news from RSS feeds
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real news from RSS feeds
      const fetchedNews = await rssService.fetchFeeds();
      setNewsItems(fetchedNews);
      
      // If we didn't get any news, show an error
      if (fetchedNews.length === 0) {
        setError('No news articles found. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, []);
  
  // Generate news intro
  useEffect(() => {
    if (newsItems.length > 0) {
      const currentTime = new Date();
      const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      
      setNewsIntro(`Welcome to the AI Radio Station News at ${timeString} on ${dateString}. I'm your news anchor bringing you the top stories of the hour.`);
    }
  }, [newsItems]);
  
  // Play news with voice
  const playNews = async (news: NewsItem, index: number, autoAdvance = false) => {
    // Only stop if manually clicking the same news that's already playing
    if (!autoAdvance && selectedNews?.id === news.id && isPlaying) {
      podcastVoiceService.stopSpeech();
      setIsPlaying(false);
      setContinuousPlay(false);
      return;
    }
    
    setSelectedNews(news);
    setCurrentNewsIndex(index);
    
    try {
      // Always use the full content for better detail
      const fullContent = news.content || news.summary;
      const processedContent = await openaiService.summarizeContent(fullContent);
      
      // Start playing the news with voice
      setIsPlaying(true);
      setActiveSpeaker('News Anchor');
      
      // Skip first story as it's handled in startNewsBulletin
      if (index === 0 && autoAdvance) {
        return; // Skip processing as it's already done in startNewsBulletin
      }
      
      const content = `${news.source} reports: ${news.title}. ${processedContent}`;
      
      // Speak the news content
      podcastVoiceService.speakWithHostVoice(
        content,
        'host1', 
        () => {
          // Move to next news if in continuous play mode
          if (continuousPlay && index < newsItems.length - 1) {
            playNews(newsItems[index + 1], index + 1, true);
          } else if (continuousPlay && index === newsItems.length - 1) {
            // End of news bulletin
            podcastVoiceService.speakWithHostVoice(
              "That's all for now. Thank you for listening.", 
              'host1', 
              () => {
                setContinuousPlay(false);
                setIsPlaying(false);
              }
            );
          }
          setIsPlaying(false);
        }
      );
    } catch (err) {
      console.error('Error playing news:', err);
      setIsPlaying(false);
      setContinuousPlay(false);
    }
  };
  
  // Start continuous news playback
  const startNewsBulletin = async () => {
    if (isPlaying) {
      // Stop current playback
      podcastVoiceService.stopSpeech();
      setIsPlaying(false);
      setContinuousPlay(false);
      return;
    }
    
    if (newsItems.length === 0) return;
    
    setContinuousPlay(true);
    setIsPlaying(true);
    
    // Get first news content
    const firstNews = newsItems[0];
    const fullContent = firstNews.content || firstNews.summary;
    const processedContent = await openaiService.summarizeContent(fullContent);
    
    // Play intro and complete first news in one continuous speech
    podcastVoiceService.speakWithHostVoice(
      `${newsIntro} Our top story: ${firstNews.source} reports: ${firstNews.title}. ${processedContent}`, 
      'host1', 
      () => {
        // Move directly to second news item
        if (newsItems.length > 1) {
          playNews(newsItems[1], 1, true);
        } else {
          setContinuousPlay(false);
          setIsPlaying(false);
        }
      }
    );
  };
  
  // Skip to next news item
  const skipToNext = () => {
    if (currentNewsIndex < newsItems.length - 1) {
      podcastVoiceService.stopSpeech();
      playNews(newsItems[currentNewsIndex + 1], currentNewsIndex + 1, continuousPlay);
    }
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <div className="space-y-6">
      {/* News Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Newspaper className="mr-2 h-6 w-6 text-purple-400" />
            AI News Radio
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={startNewsBulletin}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${continuousPlay ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              disabled={loading || newsItems.length === 0}
            >
              <Radio className="mr-2 h-4 w-4" />
              {continuousPlay ? 'Stop Broadcast' : 'Start News Broadcast'}
            </button>
            <button 
              onClick={fetchNews} 
              className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <p className="text-gray-300">
          Listen to the latest news read by our AI news anchor. Click "Start News Broadcast" for continuous playback or select individual stories below.
        </p>
      </div>
      
      {/* News Player - Only show when a news item is selected */}
      {selectedNews && (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedNews.title}</h3>
              <p className="text-gray-400 text-sm">
                {selectedNews.source} • {formatDate(selectedNews.publishDate)}
              </p>
            </div>
            <button 
              onClick={() => playNews(selectedNews, currentNewsIndex)}
              className="bg-purple-600 hover:bg-purple-700 rounded-full p-3 text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Audio Visualization */}
          <div className="relative h-16 mb-4">
            {isPlaying ? (
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">{activeSpeaker.charAt(0)}</span>
                  </div>
                </div>
                <AudioWaves />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-full bg-gray-700 rounded-full">
                  <div className="h-0.5 bg-purple-500 rounded-full w-0" />
                </div>
              </div>
            )}
          </div>
          
          {/* Controls */}
          {isPlaying && (
            <div className="flex justify-center mb-4">
              <button
                onClick={skipToNext}
                className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors mr-2"
                disabled={currentNewsIndex >= newsItems.length - 1}
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="bg-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">
            <div className="text-gray-300 space-y-4">
              {(selectedNews.content || selectedNews.summary).split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <a 
              href={selectedNews.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
            >
              Read full article <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      )}
      
      {/* News List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Rss className="mr-2 h-5 w-5" />
          Latest News
        </h3>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white/5 rounded-xl p-4 text-red-400 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
            <button 
              onClick={fetchNews}
              className="ml-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
            >
              Try Again
            </button>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-4 text-gray-400">
            No news items available
          </div>
        ) : (
          <div className="space-y-4">
            {newsItems.map((news, index) => (
              <div 
                key={news.id}
                onClick={() => playNews(news, index, false)}
                className={`bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-colors ${selectedNews?.id === news.id ? 'ring-2 ring-purple-500' : ''} ${continuousPlay && currentNewsIndex >= index ? 'opacity-70' : ''}`}
              >
                <div className="flex">
                  {news.imageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src={news.imageUrl} 
                        alt={news.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-white mb-1">{news.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      {news.source} • {formatDate(news.publishDate)}
                    </p>
                    <p className="text-gray-300 text-sm line-clamp-2">{news.summary.replace(/<[^>]+>/g, '')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
