import { v4 as uuidv4 } from 'uuid';
import { openaiService } from './openaiService';

export interface RssItem {
  id: string;
  title: string;
  source: string;
  link: string;
  publishDate: string;
  summary: string;
  content: string;
  imageUrl?: string;
}

// RSS to JSON conversion service
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const RSS2JSON_API_KEY = import.meta.env.VITE_RSS2JSON_API_KEY; // Get API key from environment

// RSS feed URLs
export const RSS_FEEDS = [
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/international/rss' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
];

// Mock news data as a reliable fallback if all else fails
const MOCK_NEWS: RssItem[] = [
  {
    id: uuidv4(),
    title: 'Global Climate Summit Reaches Historic Agreement',
    source: 'World News Network',
    link: 'https://example.com/climate-summit',
    publishDate: new Date().toISOString(),
    summary: 'World leaders have reached a historic agreement at the Global Climate Summit, committing to ambitious targets to reduce carbon emissions and increase funding for climate adaptation.',
    content: 'In a landmark moment for climate action, world leaders have reached a historic agreement at the Global Climate Summit. The agreement includes ambitious targets to reduce carbon emissions by 50% by 2030 and achieve net-zero emissions by 2050. Additionally, developed nations have committed to significantly increase funding for climate adaptation measures in vulnerable countries. Environmental experts are calling this a turning point in the global fight against climate change.',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450e7f08d021?w=600'
  },
  {
    id: uuidv4(),
    title: 'AI Breakthrough: New Model Achieves Human-Level Performance',
    source: 'Tech Daily',
    link: 'https://example.com/ai-breakthrough',
    publishDate: new Date().toISOString(),
    summary: 'Researchers have developed a new AI model that achieves human-level performance on a range of complex tasks, including reasoning, planning, and natural language understanding.',
    content: 'Researchers at a leading AI lab have developed a groundbreaking new model that achieves human-level performance on a wide range of complex tasks. The model, which uses a novel architecture combining transformer networks with reinforcement learning, has shown remarkable abilities in reasoning, planning, and natural language understanding. This breakthrough could accelerate progress in fields ranging from healthcare to education.',
    imageUrl: 'https://images.unsplash.com/photo-1677442135136-760c813028c0?w=600'
  },
  {
    id: uuidv4(),
    title: 'New Study Shows Benefits of Meditation for Brain Health',
    source: 'Health Science Journal',
    link: 'https://example.com/meditation-study',
    publishDate: new Date().toISOString(),
    summary: 'A new study has found that regular meditation practice can lead to significant improvements in brain health, including increased gray matter density and enhanced cognitive function.',
    content: 'A comprehensive new study published in the Journal of Neuroscience has found that regular meditation practice leads to significant improvements in brain health. The research, which followed participants over a five-year period, showed that those who meditated regularly had increased gray matter density in regions associated with attention, emotional regulation, and memory. Additionally, these participants demonstrated enhanced cognitive function on a variety of tests. The researchers suggest that meditation could be an effective intervention for preventing age-related cognitive decline.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600'
  }
];



// Default news item to return when no feeds are available
const createDefaultNewsItem = (): RssItem => ({
  id: uuidv4(),
  title: 'Unable to load news at this time',
  source: 'AI Radio Station',
  link: '',
  publishDate: new Date().toISOString(),
  summary: 'We are currently experiencing difficulties retrieving the latest news. Please try again later or check your internet connection.',
  content: 'We are currently experiencing difficulties retrieving the latest news. Our system was unable to connect to news sources. This could be due to network connectivity issues, changes in RSS feed formats, or temporary outages with our news providers. Please try refreshing the news feed later, or check your internet connection if the problem persists.',
  imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600'
});

export const rssService = {
  /**
   * Fetches news from RSS feeds using rss2json.com
   */
  async fetchFeeds(): Promise<RssItem[]> {
    try {
      console.log('Fetching RSS feeds');
      
      const allItems: RssItem[] = [];
      
      // Fetch each RSS feed
      for (const feed of RSS_FEEDS) {
        try {
          console.log(`Fetching feed: ${feed.name} from ${feed.url}`);
          
          // Convert RSS to JSON using rss2json.com
          const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(feed.url)}&api_key=${RSS2JSON_API_KEY}&count=10`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`RSS2JSON API responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('RSS feed response:', data);
          
          if (data.status === 'ok' && data.items && data.items.length > 0) {
            // Process each item in the feed
            const items = data.items.map((item: any) => ({

                id: uuidv4(),
                title: item.title || 'Untitled',
                source: feed.name,
                link: item.link || '',
                publishDate: item.pubDate || new Date().toISOString(),
                summary: item.description || 'No description available',
                content: this.cleanHtmlContent(item.description || item.content || 'No content available'),
                imageUrl: item.thumbnail || this.extractImageFromContent(item.content || '') || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'
              }
            ));

            
            allItems.push(...items);
            console.log(`Added ${items.length} items from ${feed.name}`);
          }
        } catch (feedError) {
          console.error(`Error fetching feed ${feed.name}:`, feedError);
          // Continue with other feeds even if one fails
        }
      }
      
      // If we still couldn't fetch any items, use our reliable mock data
      if (allItems.length === 0) {
        console.log('No items fetched from RSS feeds, using mock data as fallback');
        return MOCK_NEWS;
      }
      
      // Sort by publish date (newest first)
      allItems.sort((a, b) => {
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });
      
      // Return top 20 news items
      return allItems.slice(0, 20);
      
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return [createDefaultNewsItem()]; // Return a default message
    }
  },
  
  /**
   * Extracts image URL from HTML content
   */
  extractImageFromContent(content: string): string | undefined {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = content.match(imgRegex);
    return match ? match[1] : undefined;
  },
  
  /**
   * Creates a news summary for the AI news anchor to read
   */
  async createNewsDigest(items: RssItem[], count = 3): Promise<string> {
    try {
      // Get the top news items
      const topItems = items.slice(0, count);
      
      // Create a digest intro
      const intro = `Here are today's top ${count} news stories:`;
      
      // Format each news item
      const newsDigest = topItems.map((item, index) => {
        return `Story number ${index + 1}: ${item.title}. ${item.summary}`;
      }).join(' ');
      
      // Combine intro and digest
      return `${intro} ${newsDigest}`;
    } catch (error) {
      console.error('Error creating news digest:', error);
      return 'I apologize, but I am unable to provide a news digest at this time.';
    }
  },
  
  /**
   * Uses OpenAI to generate a summary of a news article
   */
  async summarizeArticle(content: string): Promise<string> {
    try {
      return await openaiService.summarizeContent(content);
    } catch (error) {
      console.error('Error summarizing article:', error);
      return 'Unable to generate summary.';
    }
  },

  /**
   * Clean HTML content and format it for display
   */
  cleanHtmlContent(content: string): string {
    // First extract any links we want to preserve
    const links: {text: string, url: string}[] = [];
    content = content.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, (_, url, text) => {
      links.push({text, url});
      return text;
    });

    // Remove all HTML tags
    let cleanText = content
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Add back any important links at the end
    if (links.length > 0) {
      cleanText = cleanText.replace('Continue reading...', '');
      if (!cleanText.endsWith('.')) cleanText += '.';
      cleanText += '\n\nRelated links:';
      links.forEach(({text, url}) => {
        if (!text.includes('Continue reading')) {
          cleanText += `\n• ${text} (${url})`;
        }
      });
    }

    return cleanText;
  }
};
