import React from 'react';
import { Radio, Headphones, Newspaper } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-full border border-white/20 p-1 flex">
        <button
          onClick={() => setActiveTab('music')}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeTab === 'music' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
        >
          <Radio className="mr-2 h-4 w-4" />
          Music
        </button>
        <button
          onClick={() => setActiveTab('podcast')}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeTab === 'podcast' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
        >
          <Headphones className="mr-2 h-4 w-4" />
          Podcasts
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center ${activeTab === 'news' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
        >
          <Newspaper className="mr-2 h-4 w-4" />
          News
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
