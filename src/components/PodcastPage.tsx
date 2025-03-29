import React, { useState, useEffect } from 'react';
import { Mic, MessageSquare, Play, Pause, SkipForward, Clock } from 'lucide-react';
import AudioWaves from './AudioWaves';
import { podcastVoiceService } from '../services/podcastVoiceService';
import { openaiService } from '../services/openaiService';

interface PodcastPageProps {
  className?: string;
}

interface PodcastHost {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  voiceStyle: string;
}

interface PodcastTopic {
  id: string;
  title: string;
  description: string;
}

interface PodcastMessage {
  speaker: string;
  text: string;
}

const PodcastPage: React.FC<PodcastPageProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [conversation, setConversation] = useState<PodcastMessage[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<PodcastTopic | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  // Mock podcast hosts with more distinct personalities
  const podcastHosts: PodcastHost[] = [
    {
      id: 'host1',
      name: 'Alex',
      imageUrl: 'https://picsum.photos/seed/alex/200',
      bio: 'Energetic tech enthusiast with a passion for AI and future technologies. Known for asking the big questions that get to the heart of complex topics.',
      voiceStyle: 'enthusiastic'
    },
    {
      id: 'host2',
      name: 'Rachel',
      imageUrl: 'https://picsum.photos/seed/rachel/200',
      bio: 'Insightful cultural critic and futurist with a knack for spotting emerging trends. Brings real-world examples and personal stories to every discussion.',
      voiceStyle: 'thoughtful'
    }
  ];
  
  // Mock podcast topics
  const podcastTopics: PodcastTopic[] = [
    {
      id: 'topic1',
      title: 'The Future of AI',
      description: 'Discussing the impact of artificial intelligence on society and work'
    },
    {
      id: 'topic2',
      title: 'Digital Privacy',
      description: 'Exploring the balance between convenience and privacy in the digital age'
    },
    {
      id: 'topic3',
      title: 'Virtual Reality',
      description: 'How VR and AR are changing entertainment and social interaction'
    },
    {
      id: 'topic4',
      title: 'Sustainable Tech',
      description: 'Green technologies and the environmental impact of our digital lives'
    }
  ];
  
  // Function to start a podcast on a selected topic
  const startPodcast = (topic: PodcastTopic) => {
    setSelectedTopic(topic);
    setIsPlaying(true);
    generateConversation(topic, podcastHosts);
  };
  
  // Toggle play/pause for the podcast
  const togglePlayPause = () => {
    console.log(`Toggling play/pause. Current state: ${isPlaying}`);
    
    if (isPlaying) {
      // Pause the podcast
      console.log('Pausing podcast');
      podcastVoiceService.stopSpeech();
      setIsPlaying(false);
    } else {
      // Resume the podcast
      console.log('Resuming podcast');
      setIsPlaying(true);
      
      // If we have an active speaker, continue from where we left off
      if (conversation.length > 0) {
        // Find the current message being spoken or start from the beginning
        let currentMessageIndex = -1;
        
        if (activeSpeaker) {
          currentMessageIndex = conversation.findIndex(msg => msg.speaker === activeSpeaker);
        }
        
        // If no active speaker or not found, start from the beginning
        if (currentMessageIndex < 0) {
          currentMessageIndex = 0;
        }
        
        console.log(`Resuming from message index: ${currentMessageIndex}`);
        
        const currentMessage = conversation[currentMessageIndex];
        const currentHost = podcastHosts.find(host => host.name === currentMessage.speaker);
        const hostType = (currentHost?.id === 'host1' || currentHost?.id === 'host2') 
          ? currentHost.id 
          : 'host1';
        
        console.log(`Speaking with ${hostType} voice: ${currentMessage.text.substring(0, 50)}...`);
        
        // Speak the current message again
        podcastVoiceService.speakWithHostVoice(currentMessage.text, hostType, () => {
          // Continue with the next messages if any
          console.log(`Finished speaking message ${currentMessageIndex}, moving to next`);
          playMessagesFromIndex(currentMessageIndex + 1);
        });
      } else if (selectedTopic) {
        // If we have a selected topic but no conversation, generate a new one
        console.log('No conversation available, generating new one');
        generateConversation(selectedTopic, podcastHosts);
      }
    }
  };
  
  // Function to play messages from a specific index
  const playMessagesFromIndex = (startIndex: number) => {
    if (startIndex < conversation.length && selectedTopic) {
      let currentIndex = startIndex;
      
      const playNextMessage = async () => {
        if (currentIndex < conversation.length && isPlaying) {
          const currentMessage = conversation[currentIndex];
          currentIndex++;
          
          setActiveSpeaker(currentMessage.speaker);
          
          // Determine which host is speaking
          const currentHostType = currentMessage.speaker === podcastHosts[0].name ? 'host1' : 'host2';
          
          // Pre-generate the next message's audio if there is a next message
          let nextMessagePromise = null;
          if (currentIndex < conversation.length) {
            const nextMessage = conversation[currentIndex];
            // Determine the host type for the next message
            const nextHostType = nextMessage.speaker === podcastHosts[0].name ? 'host1' : 'host2';
            
            // Start pre-generating the next message's audio (but don't play it yet)
            nextMessagePromise = podcastVoiceService.textToSpeech(nextMessage.text, nextHostType);
          }
          
          // Speak the current message
          podcastVoiceService.speakWithHostVoice(currentMessage.text, currentHostType, async () => {
            // Add a short pause between speakers for natural conversation flow
            setTimeout(async () => {
              if (isPlaying) {
                setActiveSpeaker(null);
                
                // If we pre-generated the next message, it should be ready by now
                if (nextMessagePromise) {
                  // Wait for pre-generation to complete if it hasn't already
                  await nextMessagePromise;
                }
                
                // Move to the next message
                playNextMessage();
              }
            }, 1000);
          });
        }
      };
      
      // Start playing from the specified index
      playNextMessage();
    }
  };
  
  // Generate podcast conversation
  const generateConversation = async (topic: PodcastTopic, hosts: PodcastHost[]) => {
    try {
      // Clear any previous conversation
      setConversation([]);
      
      // Cancel any ongoing speech
      podcastVoiceService.stopSpeech();
      
      // Generate dynamic conversation using OpenAI service
      console.log('Generating dynamic conversation for topic:', topic.title);
      const dynamicConversation = await openaiService.generatePodcastConversation(topic, hosts);
      
      // Log the generated conversation
      console.log('Generated conversation:', JSON.stringify(dynamicConversation, null, 2));
      console.log(`Total messages in conversation: ${dynamicConversation.length}`);
      
      if (!dynamicConversation || dynamicConversation.length === 0) {
        console.error('No conversation messages generated');
        return;
      }
      
      // Set playing state - force it to true
      console.log('Setting isPlaying to true');
      setIsPlaying(true);
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Function to play the next message in sequence
      const playMessage = async (index: number) => {
        console.log(`Playing message ${index + 1}/${dynamicConversation.length}`);
        console.log(`Current isPlaying state: ${isPlaying}`);
        
        if (index >= dynamicConversation.length) {
          console.log('Conversation complete, no more messages');
          setActiveSpeaker(null);
          return;
        }
        
        // Force isPlaying to true for each message
        if (!isPlaying) {
          console.log('isPlaying was false, forcing to true');
          setIsPlaying(true);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const currentMessage = dynamicConversation[index];
        console.log(`Current message:`, JSON.stringify(currentMessage, null, 2));
        
        // Add the current message to the conversation
        setConversation(prev => [...prev, currentMessage]);
        setActiveSpeaker(currentMessage.speaker);
        
        // Determine which host is speaking
        const speakerName = currentMessage.speaker;
        console.log(`Speaker name: "${speakerName}"`);
        
        const currentHost = hosts.find(host => host.name === speakerName);
        console.log(`Found host:`, currentHost);
        
        const currentHostType = (currentHost?.id === 'host1' || currentHost?.id === 'host2') 
          ? currentHost.id 
          : 'host1';
        
        console.log(`Current speaker: ${speakerName}, hostType: ${currentHostType}`);
        
        // Pre-generate the next message's audio if there is a next message
        let nextMessagePromise = null;
        if (index + 1 < dynamicConversation.length) {
          const nextMessage = dynamicConversation[index + 1];
          console.log(`Pre-generating next message:`, JSON.stringify(nextMessage, null, 2));
          
          const nextSpeakerName = nextMessage.speaker;
          const nextHost = hosts.find(host => host.name === nextSpeakerName);
          const nextHostType = (nextHost?.id === 'host1' || nextHost?.id === 'host2') 
            ? nextHost.id 
            : 'host2';
          
          console.log(`Pre-generating audio for ${nextSpeakerName}, hostType: ${nextHostType}`);
          
          // Start pre-generating the next message's audio (but don't play it yet)
          nextMessagePromise = podcastVoiceService.textToSpeech(nextMessage.text, nextHostType);
        }
        
        // Speak the current message
        console.log(`Speaking with ${currentHostType} voice:`, currentMessage.text.substring(0, 50) + '...');
        
        try {
          // Play the current message and wait for it to complete
          await new Promise<void>((resolve) => {
            podcastVoiceService.speakWithHostVoice(currentMessage.text, currentHostType, () => {
              console.log(`Speech completed for ${currentMessage.speaker}`);
              setTimeout(resolve, 1000); // Short pause between speakers
            });
          });
          
          // Wait for the next message's audio to be ready if we pre-generated it
          if (nextMessagePromise) {
            console.log('Waiting for pre-generated audio to be ready');
            await nextMessagePromise;
          }
          
          // Move to the next message
          console.log(`Moving to next message (${index + 1})`);
          await playMessage(index + 1);
          
        } catch (error) {
          console.error('Error during speech playback:', error);
        }
      };
      
      // Start the conversation
      console.log('Starting conversation playback');
      // Ensure isPlaying is true before starting
      if (!isPlaying) {
        console.log('isPlaying was false before starting, setting to true');
        setIsPlaying(true);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      playMessage(0);
      
    } catch (error) {
      console.error('Error generating conversation:', error);
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update current time when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTime < 100) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);
  
  // Get available voices
  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    
    // Chrome requires this event listener to load voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      // Cancel any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Handle audio playback and speech synthesis
  useEffect(() => {
    if (!isPlaying) {
      // If paused, stop speech synthesis
      podcastVoiceService.stopSpeech();
    }
    
    // Cleanup when component unmounts
    return () => {
      podcastVoiceService.stopSpeech();
    };
  }, [isPlaying]);
  
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Podcast Player & Hosts */}
        <div className="space-y-6">
          {/* Podcast Player */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Mic className="mr-2 h-5 w-5" />
                AI Podcast
              </h3>
              <div className="text-sm text-gray-300 flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {formatTime(currentTime)} / {formatTime(100)}
              </div>
            </div>
            
            {selectedTopic ? (
              <>
                <h4 className="text-lg font-semibold text-white mb-2">{selectedTopic.title}</h4>
                <p className="text-gray-300 mb-4">{selectedTopic.description}</p>
                
                {/* Audio Visualization */}
                <div className="relative h-16 mb-4">
                  {isPlaying && <AudioWaves />}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-0.5 w-full bg-gray-700 rounded-full">
                        <div 
                          className="h-0.5 bg-purple-500 rounded-full" 
                          style={{ width: `${(currentTime / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex justify-center items-center space-x-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors">
                    <SkipForward className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Select a topic below to start a new podcast</p>
              </div>
            )}
          </div>
          
          {/* Podcast Hosts */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Your Hosts</h3>
            <div className="grid grid-cols-2 gap-4">
              {podcastHosts.map(host => (
                <div 
                  key={host.id} 
                  className={`bg-white/5 rounded-xl p-4 ${activeSpeaker === host.name ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <div className="flex items-center mb-2">
                    <img 
                      src={host.imageUrl} 
                      alt={host.name} 
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <h4 className="text-white font-medium flex items-center">
                        {host.name}
                        {activeSpeaker === host.name && (
                          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                        )}
                      </h4>
                      <p className="text-gray-400 text-sm">{host.voiceStyle}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{host.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Topics & Conversation */}
        <div className="space-y-6">
          {/* Topic Selection - Moved to the top for better visibility */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Mic className="mr-2 h-5 w-5 text-purple-400" />
              <span>Select a Podcast Topic</span>
              <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded-full">Required</span>
            </h3>
            <p className="text-gray-300 text-sm mb-4">Choose a topic below to start the podcast conversation</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {podcastTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => startPodcast(topic)}
                  className={`text-left p-4 rounded-lg transition-all ${selectedTopic?.id === topic.id 
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300' 
                    : 'bg-white/5 text-white hover:bg-white/10 hover:scale-102 transform'}`}
                >
                  <h4 className="font-medium mb-1">{topic.title}</h4>
                  <p className="text-sm ${selectedTopic?.id === topic.id ? 'text-gray-100' : 'text-gray-300'}">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Conversation Display */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl h-[400px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Conversation
            </h3>
            
            {conversation.length > 0 ? (
              <div className="space-y-4">
                {conversation.map((message, index) => (
                  <div 
                    key={index} 
                    className={`rounded-lg p-3 transition-all duration-300 ${message.speaker === activeSpeaker ? 'bg-purple-600/30 border border-purple-500/50' : 'bg-white/5'}`}
                  >
                    <div className="font-medium text-white mb-1 flex items-center">
                      {message.speaker}
                      {message.speaker === activeSpeaker && (
                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-gray-300">{message.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Select a topic above to start the conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastPage;
