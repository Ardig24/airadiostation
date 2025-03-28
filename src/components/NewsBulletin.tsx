import React, { useEffect, useState } from 'react';
import { newsService, NewsArticle } from '../services/newsService';
import { Newspaper, AlertTriangle, ExternalLink, Clock } from 'lucide-react';

interface NewsBulletinProps {
  className?: string;
  categories?: string[];
  compact?: boolean;
}

const NewsBulletin: React.FC<NewsBulletinProps> = ({ 
  className = '', 
  categories = ['general', 'business', 'technology'], 
  compact = false 
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        let allArticles: NewsArticle[] = [];
        
        // Get articles from each category
        for (const category of categories) {
          const categoryArticles = await newsService.getLatestNews(category, compact ? 2 : 5);
          allArticles = [...allArticles, ...categoryArticles];
        }
        
        // Sort by published date (newest first)
        allArticles.sort((a, b) => {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        
        // Take top articles
        const topArticles = allArticles.slice(0, compact ? 3 : 8);
        setArticles(topArticles);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news information');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // Update news every hour
    const intervalId = setInterval(fetchNews, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [categories, compact]);

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

  if (articles.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <p className="text-gray-400">No news articles available</p>
      </div>
    );
  }

  // Compact view for sidebar or smaller spaces
  if (compact) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Newspaper className="mr-2 h-5 w-5" />
            Latest News
          </h3>
        </div>
        
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
              <h4 className="text-white font-medium text-sm">{article.title}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{article.source}</span>
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(article.publishedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full view with more details
  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Newspaper className="mr-2 h-6 w-6" />
          News Bulletin
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <div key={article.id} className="bg-white/5 rounded-lg overflow-hidden">
            {article.imageUrl && (
              <div className="h-40 overflow-hidden">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded uppercase">
                  {article.category}
                </span>
                <span className="text-xs text-gray-400">{formatDate(article.publishedAt)}</span>
              </div>
              <h4 className="text-white font-medium mt-2">{article.title}</h4>
              {article.summary && (
                <p className="text-gray-300 text-sm mt-2 line-clamp-3">{article.summary}</p>
              )}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">{article.source}</span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 text-sm flex items-center hover:text-purple-300 transition-colors"
                >
                  Read More
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsBulletin;
