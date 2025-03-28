-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('music', 'news', 'podcast', 'requests', 'weather', 'traffic', 'interview', 'spotlight', 'advertisement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  host_dj_id UUID REFERENCES djs(id),
  image_url TEXT,
  background_color TEXT,
  accent_color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TEXT NOT NULL, -- Format: 'HH:MM' in 24-hour format
  end_time TEXT NOT NULL, -- Format: 'HH:MM' in 24-hour format
  program_type TEXT NOT NULL CHECK (program_type IN ('music', 'news', 'podcast', 'requests', 'weather', 'traffic', 'interview', 'spotlight', 'advertisement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  script TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  advertiser_name TEXT NOT NULL,
  advertiser_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  host TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create podcast_episodes table
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  summary TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weather_forecasts table
CREATE TABLE IF NOT EXISTS weather_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  temperature NUMERIC,
  condition TEXT,
  humidity INTEGER,
  wind_speed NUMERIC,
  forecast_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create traffic_updates table
CREATE TABLE IF NOT EXISTS traffic_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access to programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to time_slots" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to advertisements" ON advertisements FOR SELECT USING (is_active = true);
CREATE POLICY "Allow anonymous read access to news_items" ON news_items FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to podcasts" ON podcasts FOR SELECT USING (is_active = true);
CREATE POLICY "Allow anonymous read access to podcast_episodes" ON podcast_episodes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to weather_forecasts" ON weather_forecasts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to traffic_updates" ON traffic_updates FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_time_slots_end_time ON time_slots(end_time);
CREATE INDEX idx_time_slots_days_of_week ON time_slots USING GIN(days_of_week);
CREATE INDEX idx_news_items_published_at ON news_items(published_at);
CREATE INDEX idx_podcast_episodes_published_at ON podcast_episodes(published_at);
CREATE INDEX idx_weather_forecasts_forecast_date ON weather_forecasts(forecast_date);
