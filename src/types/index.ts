// Track interface for song information
export interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioUrl?: string;
  file_url?: string;
  duration: number;
  genre?: string[];
  mood?: string[];
  releaseDate?: string;
  album?: string;
  tempo?: number;
}

// User message interface for AI DJ interaction
export interface UserMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'request';
}

// Content item interface for AI DJ announcements, news, tracks and messages
export interface ContentItem {
  id: string;
  content: string;
  timestamp: Date;
  type: 'announcement' | 'news' | 'track' | 'message';
  title?: string;
  artist?: string;
  coverArt?: string;
  relatedTrackId?: string;
}

// Voice profile interface for AI DJ
export interface VoiceProfile {
  id: string;
  name: string;
  personality?: string;
}

// Playlist interface
export interface Playlist {
  id: string;
  name: string;
  description?: string;
}

// Radio station state interface for global state management
export interface RadioState {
  // Playback state
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  progress: number;
  isDjSpeaking: boolean;
  isChatResponse: boolean; // Flag to differentiate between track announcements and chat responses
  isAudioPlaying: boolean; // Flag to track if any audio is currently playing
  isTrackChanging: boolean; // Flag to lock the track changing process
  
  // Playlist management
  playlist: Track[];
  history: Track[];
  queue: Track[];
  currentPlaylist: {
    id: string;
    name: string;
    description: string;
  };
  
  // User interaction
  userMessages: UserMessage[];
  contentItems: ContentItem[];
  
  // AI DJ state
  currentVoiceProfile: {
    id: string;
    name: string;
    personality: string;
  };
  listenerCount: number;
  
  // Application state
  isLoading: boolean;
  error: string | null;
  
  // Methods
  initialize: () => Promise<void>;
  togglePlayPause: () => void;
  startWelcomeSequence: () => Promise<void>;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  next: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  addUserMessage: (content: string) => Promise<void>;
  addContentItem: (content: string, type: 'announcement' | 'news' | 'track' | 'message', options?: {
    title?: string;
    artist?: string;
    coverArt?: string;
    relatedTrackId?: string;
  }) => Promise<ContentItem>;
  setDjSpeaking: (speaking: boolean) => void;
}
