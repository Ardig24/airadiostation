# AI Radio Station 🎧🤖

An AI-powered online radio station that delivers a 24/7 personalized audio experience with AI DJs, dynamic content generation, and interactive features. This project is being developed for a hackathon.

## Overview

AI Radio Station transforms the traditional radio experience by leveraging artificial intelligence to create a fully automated yet personalized radio station. The system features AI DJs that announce songs, read news, engage with listeners, and create dynamic content - all without human intervention.

## Features

- 🎙️ **AI DJ & Host** - Voice-based AI that speaks like a real radio host
- 📰 **News & Podcast Aggregator** - AI that gathers, summarizes, and reads news
- 🎵 **Intelligent Music Selection** - AI-curated playlists based on trends and moods
- 💰 **Ad Insertion** - Monetization via AI-generated or pre-recorded ads
- 💬 **Live Listener Interaction** - AI responds to messages and plays user requests
- 🎧 **Podcast Generation** - AI creates its own daily/weekly shows on various topics
- 🔄 **24/7 Automation** - Everything runs without human intervention

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase for database and authentication
- **Voice Synthesis**: ElevenLabs for realistic AI voices
- **Text Generation**: OpenAI for content generation
- **Audio Streaming**: WebRTC or HLS for browser-based streaming

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account
- ElevenLabs API key
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd radiostation
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server
```bash
npm run dev
```

## Project Structure

```
/src
  /components        # Reusable UI components
  /hooks             # Custom React hooks
  /services          # API and service integrations
  /store             # State management
  /types             # TypeScript type definitions
  /utils             # Utility functions
  /pages             # Main application pages
  /assets            # Static assets
```

## Contributing

This project is part of a hackathon. Contributions are welcome!

## License

[MIT](LICENSE)
