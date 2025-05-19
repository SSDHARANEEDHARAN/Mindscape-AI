import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { companyInfo } from './companyInfo';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  hideInChat?: boolean;
}

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBy0KCb5kFziYZC5gXkFgB3mXEmMzsatTE';

// Helper function to get stored messages
const getStoredMessages = (userId: string | undefined): ChatMessage[] => {
  if (!userId) return [];
  const stored = localStorage.getItem(`mindscape_chat_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Helper function to store messages
const storeMessages = (userId: string | undefined, messages: ChatMessage[]) => {
  if (userId) {
    localStorage.setItem(`mindscape_chat_${userId}`, JSON.stringify(messages));
  }
};

const Chatbot: React.FC = () => {
  const { userData, moodData, healthInsights } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initialize with stored messages or default messages
    const storedMessages = getStoredMessages(userData?.id);
    return storedMessages.length > 0 ? storedMessages : [
      {
        role: 'model',
        text: `Hello${userData?.name ? `, ${userData.name}` : ''}! I'm your MindScape AI assistant. How can I help you today?`,
      },
      {
        role: 'model',
        text: companyInfo,
        hideInChat: true
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    storeMessages(userData?.id, messages);
  }, [messages, userData?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const generateBotResponse = async (userMessage: string) => {
    try {
      const conversationHistory = messages
        .filter(msg => !msg.hideInChat)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const systemContext = {
        role: 'user',
        parts: [{
          text: `You are MindScape, a friendly mental health AI assistant. 
          Our website is MindScape.ai - mention this when appropriate.
          The user is ${userData?.name || 'a user'}, age ${userData?.age || 'unknown'}.
          Recent mood data: ${JSON.stringify(moodData || {})}
          Health insights: ${JSON.stringify(healthInsights || {})}
          
          Respond naturally to greetings like "hi" with a friendly response.
          Be empathetic, supportive, and provide helpful mental health advice based on the context.`
        }]
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [systemContext, ...conversationHistory],
          generationConfig: {
            temperature: 0.9,
            topP: 1,
            maxOutputTokens: 2048
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
             "I've processed your request but didn't get a clear response. Could you rephrase that?";
    } catch (error) {
      console.error('API Error:', error);
      throw new Error("I'm having technical difficulties. Please try again in a moment.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      setMessages(prev => [...prev, { role: 'model', text: 'Thinking...' }]);
      const aiResponse = await generateBotResponse(userMessage);

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop();
        return [...newMessages, { role: 'model', text: aiResponse }];
      });
    } catch (error: unknown) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop();
        return [...newMessages, { 
          role: 'model', 
          text: error instanceof Error ? error.message : "I'm having trouble responding. Please try again.",
          isError: true 
        }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-full flex flex-col border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <h2 className="text-lg font-semibold ml-3 text-gray-800 dark:text-white">
            MindScape AI Assistant
          </h2>
        </div>
      </div>
      
      <div 
        ref={chatBodyRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 p-2"
        style={{ maxHeight: '400px' }}
      >
        {messages
          .filter(msg => !msg.hideInChat)
          .map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'model' && (
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full self-start">
                    <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                )}
                <div 
                  className={`mx-2 p-3 rounded-xl ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none'
                  } ${
                    message.isError ? 'border border-red-500' : ''
                  }`}
                >
                  {message.text === 'Thinking...' ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-transparent focus:outline-none dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`p-2 rounded-lg ${loading || !input.trim() ? 'text-gray-400' : 'text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;