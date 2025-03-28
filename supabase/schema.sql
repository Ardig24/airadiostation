-- Create tables for AI Radio Station

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  file_url TEXT NOT NULL,
  cover_art_url TEXT,
  genre TEXT[],
  mood TEXT[],
  tempo NUMERIC,
  duration NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (playlist_id, track_id)
);

-- Voice profiles table
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  elevenlabs_voice_id TEXT NOT NULL,
  personality TEXT NOT NULL,
  speaking_style TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table (for announcements, news, etc.)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audio_url TEXT,
  duration NUMERIC,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  is_played BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  type TEXT NOT NULL CHECK (type IN ('message', 'request', 'feedback')),
  content TEXT NOT NULL,
  response TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for tracks
INSERT INTO tracks (title, artist, album, file_url, cover_art_url, genre, mood, tempo, duration)
VALUES 
  ('Midnight Groove', 'The Synthwave Collective', 'Neon Dreams', 'https://example.com/tracks/midnight-groove.mp3', 'https://example.com/covers/neon-dreams.jpg', ARRAY['synthwave', 'electronic'], ARRAY['chill', 'relaxed'], 110, 240),
  ('Urban Jungle', 'Metro Beats', 'City Life', 'https://example.com/tracks/urban-jungle.mp3', 'https://example.com/covers/city-life.jpg', ARRAY['hip-hop', 'urban'], ARRAY['energetic', 'upbeat'], 95, 180),
  ('Sunset Memories', 'Coastal Vibes', 'Ocean Breeze', 'https://example.com/tracks/sunset-memories.mp3', 'https://example.com/covers/ocean-breeze.jpg', ARRAY['lofi', 'chill'], ARRAY['relaxed', 'nostalgic'], 85, 210);

-- Sample data for playlists
INSERT INTO playlists (name, description, is_featured)
VALUES 
  ('Morning Energize', 'Start your day with these upbeat tracks', TRUE),
  ('Afternoon Chill', 'Relaxing tunes for your productive afternoon', TRUE),
  ('Evening Unwind', 'Wind down with these smooth tracks', FALSE);

-- Sample data for voice profiles
INSERT INTO voice_profiles (name, elevenlabs_voice_id, personality, speaking_style, is_active)
VALUES 
  ('DJ Nova', 'eleven_labs_voice_id_1', 'Energetic and enthusiastic DJ with a passion for electronic music', 'Upbeat and engaging', TRUE),
  ('DJ Chill', 'eleven_labs_voice_id_2', 'Laid-back DJ with a smooth voice, perfect for late night sessions', 'Relaxed and soothing', TRUE);
