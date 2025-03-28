# Supabase Setup Guide for AI Radio Station

## Overview

This guide outlines the steps to set up Supabase as the backend for the AI Radio Station project. Supabase will provide database storage, authentication, and real-time capabilities.

## 1. Create a Supabase Project

1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project with a name like "ai-radio-station"
3. Choose a strong database password and save it securely
4. Select a region closest to your target audience
5. Wait for your project to be initialized

## 2. Database Schema

Below are the SQL commands to create the necessary tables for the AI Radio Station:

```sql
-- Users table extensions (extends Supabase Auth)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tracks table for music library
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  duration INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  cover_art_url TEXT,
  genre TEXT[],
  mood TEXT[],
  tempo FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content table for generated scripts, news, etc.
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'news', 'announcement', 'weather', 'show', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  is_played BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlist items (junction table)
CREATE TABLE public.playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (playlist_id, track_id)
);

-- User interactions table
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'message', 'request', 'feedback'
  content TEXT NOT NULL,
  response TEXT,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Station schedule
CREATE TABLE public.schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  program_type TEXT NOT NULL, -- 'music', 'news', 'talk', 'podcast'
  program_name TEXT NOT NULL,
  playlist_id UUID REFERENCES public.playlists(id),
  content_id UUID REFERENCES public.content(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voice profiles for AI DJs
CREATE TABLE public.voice_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  elevenlabs_voice_id TEXT,
  personality TEXT,
  speaking_style TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 3. Storage Buckets

Create the following storage buckets in the Supabase dashboard:

1. **tracks**: For storing music files
   - Public access: No (authenticated access only)
   - File size limit: 50MB

2. **audio-content**: For storing generated voice content
   - Public access: No (authenticated access only)
   - File size limit: 20MB

3. **images**: For storing album art, profile pictures, etc.
   - Public access: Yes (for easy access to images)
   - File size limit: 5MB

## 4. Authentication Setup

1. Configure email authentication in the Authentication settings
2. Set up OAuth providers if needed (Google, GitHub, etc.)
3. Configure email templates for verification, password reset, etc.

## 5. Row Level Security (RLS) Policies

Implement the following RLS policies to secure your data:

```sql
-- User profiles: Users can read all profiles but only update their own
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" 
  ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Tracks: Anyone can view tracks, only admins can modify
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks" 
  ON public.tracks FOR SELECT USING (true);

CREATE POLICY "Only admins can insert tracks" 
  ON public.tracks FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE preferences->>'role' = 'admin')
  );

-- Similar policies for other tables...
```

## 6. API and Edge Functions

Create the following Edge Functions for complex operations:

1. **generateContent**: Calls OpenAI to create radio content
2. **generateVoice**: Calls ElevenLabs to synthesize voice
3. **scheduleContent**: Manages the radio programming schedule

## 7. Real-time Subscriptions

Set up Realtime functionality for:

1. Listener count updates
2. Chat/interaction messages
3. Now playing information

## 8. Environment Variables

Add the following to your frontend `.env` file:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 9. Supabase Client Setup

Create a file in your project for the Supabase client:

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## 10. Database Types Generation

Generate TypeScript types for your Supabase database:

1. Install the Supabase CLI
2. Run `npx supabase login`
3. Run `npx supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts`

## Next Steps

- Set up initial data in your tables
- Create API functions for common operations
- Implement authentication flow in your frontend
- Test real-time subscriptions
