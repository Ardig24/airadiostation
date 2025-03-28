import React, { useState } from 'react';
import { MessageSquare, Send, Mic, Sparkles } from 'lucide-react';
import { chatDjService } from '../services/chatDjService';
import { useRadioStore } from '../store/radioStore';

const AudioWaves = () => (
  <div className="flex gap-1 items-end h-8">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-emerald-400/60 rounded-full animate-pulse"
        style={{
          height: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

const ChatDj: React.FC = () => {
  const { addContentItem } = useRadioStore();
  const [message, setMessage] = useState('');
  const [isChatDjSpeaking, setIsChatDjSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{text: string, isUser: boolean}[]>([]);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      // Add user message to chat history
      const userMessage = message.trim();
      setChatHistory(prev => [...prev, {text: userMessage, isUser: true}]);
      setMessage('');
      
      try {
        // Get response from chat DJ service
        const response = await chatDjService.respondToMessage(userMessage, setIsChatDjSpeaking);
        
        // Add the response to chat history
        setChatHistory(prev => [...prev, {text: response, isUser: false}]);
        
        // Add to content items for the timeline
        addContentItem(userMessage, 'message');
        addContentItem(response, 'announcement');
      } catch (error) {
        console.error('Error sending message:', error);
        setChatHistory(prev => [...prev, {text: "Sorry, I couldn't process your message.", isUser: false}]);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVoiceInput = () => {
    // This would integrate with the Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      alert('Voice input feature coming soon!');
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
      <div className="flex border-b border-white/10 mb-3">
        <button
          className="flex items-center gap-2 px-3 py-1 text-emerald-400 border-b-2 border-emerald-400"
        >
          <MessageSquare size={16} />
          Chat with DJ
        </button>
      </div>
      
      {/* Chat history - more compact */}
      <div className="overflow-y-auto mb-3 space-y-2 pr-2" style={{maxHeight: '120px'}}>
        {chatHistory.length === 0 ? (
          <div className="text-white/50 text-center py-2 text-sm">
            <p>Send a message to chat with the DJ</p>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-lg max-w-[85%] ${chat.isUser ? 'bg-emerald-500/20 ml-auto' : 'bg-white/10 mr-auto'}`}
            >
              <p className="text-white text-xs">{chat.text}</p>
            </div>
          ))
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSubmitMessage}>
        <div className="mb-3">
          <div className="relative">
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something to the DJ..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-emerald-400 pr-20"
              disabled={isSubmitting}
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={handleVoiceInput}
                className="p-1 text-white/70 hover:text-emerald-400 transition-colors"
              >
                <Mic size={16} />
              </button>
              <button
                type="button"
                className="p-1 text-white/70 hover:text-emerald-400 transition-colors"
                title="AI Suggestions"
              >
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white text-sm rounded-lg px-3 py-1.5 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Send size={14} />
                Send Message
              </>
            )}
          </button>
          {isChatDjSpeaking && (
            <div className="ml-2">
              <AudioWaves />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatDj;
