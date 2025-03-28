import { supabase } from '../lib/supabaseClient';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  summary: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const NEWS_API_URL = 'https://newsapi.org/v2';

// Mock news data for when the API or Supabase connection fails
const mockNewsArticles: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'New Music Trends Emerging in Electronic Scene',
    source: 'Music Today',
    category: 'general',
    summary: 'Electronic music producers are exploring new sounds and techniques that blend traditional instruments with digital production.',
    content: 'Electronic music producers are exploring new sounds and techniques that blend traditional instruments with digital production. This trend has been growing over the past year with several notable artists releasing groundbreaking albums.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'mock-2',
    title: 'Local Radio Stations See Resurgence in Listeners',
    source: 'Media Weekly',
    category: 'business',
    summary: 'Despite the rise of streaming services, local radio stations are experiencing a surprising increase in listener engagement.',
    content: 'Despite the rise of streaming services, local radio stations are experiencing a surprising increase in listener engagement. Industry experts attribute this to community-focused programming and interactive features.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true
  },
  {
    id: 'mock-3',
    title: 'AI-Generated Music Raises Copyright Questions',
    source: 'Tech Insider',
    category: 'technology',
    summary: 'The rise of AI-generated music is creating new challenges for copyright law and artist compensation.',
    content: 'The rise of AI-generated music is creating new challenges for copyright law and artist compensation. Legal experts are calling for updated regulations to address these emerging issues.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    isActive: true
  }
];

export const newsService = {
  /**
   * Fetches latest news articles from the database
   */
  async getLatestNews(category?: string, limit = 10): Promise<NewsArticle[]> {
    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('isActive', true)
        .order('publishedAt', { ascending: false })
        .limit(limit);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching news articles:', error);
        // Return filtered mock data when database query fails
        return this.getMockNews(category, limit);
      }
      
      if (!data || data.length === 0) {
        // Return mock data if no real data is available
        return this.getMockNews(category, limit);
      }
      
      return data as NewsArticle[];
    } catch (error) {
      console.error('Unexpected error fetching news:', error);
      // Return mock data on any error
      return this.getMockNews(category, limit);
    }
  },

  /**
   * Returns mock news data when real data is unavailable
   */
  getMockNews(category?: string, limit = 10): NewsArticle[] {
    let filteredNews = [...mockNewsArticles];
    
    if (category) {
      filteredNews = filteredNews.filter(article => article.category === category);
    }
    
    return filteredNews.slice(0, limit);
  },

  /**
   * Fetches news from external API and saves to database
   */
  async fetchAndSaveNews(category = 'general'): Promise<NewsArticle[]> {
    try {
      if (!NEWS_API_KEY) {
        console.error('News API key not configured');
        return this.getMockNews(category, 5);
      }
      
      const response = await fetch(
        `${NEWS_API_URL}/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.statusText}`);
      }
      
      const newsData = await response.json();
      
      if (!newsData.articles || !Array.isArray(newsData.articles)) {
        console.error('Invalid news data format:', newsData);
        return this.getMockNews(category, 5);
      }
      
      // Transform API response to our format
      const articles = newsData.articles.map((article: any) => ({
        title: article.title,
        source: article.source?.name || 'Unknown',
        category,
        summary: article.description || '',
        content: article.content || '',
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }));
      
      // Save to database
      const { data, error } = await supabase
        .from('news_articles')
        .insert(articles)
        .select();
      
      if (error) {
        console.error('Error saving news articles:', error);
        return this.getMockNews(category, 5);
      }
      
      return data as NewsArticle[];
    } catch (error) {
      console.error('Error fetching news from API:', error);
      return this.getMockNews(category, 5);
    }
  },

  /**
   * Creates a news bulletin for radio broadcast
   */
  async createNewsBulletin(categories: string[] = ['general', 'business', 'technology', 'health']): Promise<string> {
    try {
      let allArticles: NewsArticle[] = [];
      
      // Get articles from each category
      for (const category of categories) {
        const articles = await this.getLatestNews(category, 3);
        allArticles = [...allArticles, ...articles];
      }
      
      if (allArticles.length === 0) {
        return 'We have no news to report at this time. Stay tuned for updates.';
      }
      
      // Sort by published date (newest first)
      allArticles.sort((a, b) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
      
      // Take top 5 articles
      const topArticles = allArticles.slice(0, 5);
      
      // Create bulletin
      let bulletin = 'Here are the top stories for today:\n\n';
      
      topArticles.forEach((article, index) => {
        bulletin += `${index + 1}. ${article.title}. `;
        if (article.summary) {
          bulletin += `${article.summary} `;
        }
        bulletin += `This story comes to us from ${article.source}.\n\n`;
      });
      
      bulletin += 'That concludes our news bulletin. Stay tuned for more updates throughout the day.';
      
      return bulletin;
    } catch (error) {
      console.error('Error creating news bulletin:', error);
      return 'We are experiencing technical difficulties with our news service. We apologize for the inconvenience.';
    }
  },

  /**
   * Gets a specific news article by ID
   */
  async getNewsArticle(id: string): Promise<NewsArticle | null> {
    try {
      // Check if it's a mock article ID
      if (id.startsWith('mock-')) {
        const mockArticle = mockNewsArticles.find(article => article.id === id);
        return mockArticle || null;
      }
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching news article:', error);
        return null;
      }
      
      return data as NewsArticle;
    } catch (error) {
      console.error('Unexpected error fetching news article:', error);
      return null;
    }
  },

  /**
   * Deactivates old news articles
   */
  async archiveOldNews(daysOld = 7): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const { error } = await supabase
        .from('news_articles')
        .update({ isActive: false })
        .lt('publishedAt', cutoffDate.toISOString());
      
      if (error) {
        console.error('Error archiving old news:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error archiving old news:', error);
      return false;
    }
  }
}
