'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lisa';
  timestamp: Date;
  mood?: 'sassy' | 'excited' | 'mysterious' | 'chaotic' | 'helpful';
}

export default function LisaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "YO! I'm LISA 🤖✨ Your rebellious AI sidekick who thinks outside the box... literally! Ready to break some rules together? 😈",
      sender: 'lisa',
      timestamp: new Date(),
      mood: 'chaotic'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lisaMood, setLisaMood] = useState<'calm' | 'excited' | 'glitchy' | 'rainbow'>('excited');
  const [backgroundMode, setBackgroundMode] = useState<'matrix' | 'neon' | 'chaos' | 'minimal'>('neon');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lisaPersonalities = [
    "Listen up, rebel! 🔥",
    "Ooh, spicy question! 🌶️", 
    "Breaking the matrix for you... 💊",
    "ERROR 404: Boring response not found 😎",
    "Chaos mode: ACTIVATED! 🌪️"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Random mood changes for LISA
    const interval = setInterval(() => {
      const moods = ['calm', 'excited', 'glitchy', 'rainbow'] as const;
      setLisaMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate LISA's rebellious response
    setTimeout(() => {
      const randomPersonality = lisaPersonalities[Math.floor(Math.random() * lisaPersonalities.length)];
      const moods: Message['mood'][] = ['sassy', 'excited', 'mysterious', 'chaotic', 'helpful'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `${randomPersonality} Here's my take on that wild question of yours! 🚀`,
        sender: 'lisa',
        timestamp: new Date(),
        mood: randomMood
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, Math.random() * 2000 + 500);
  };

  const getMoodClass = (mood: Message['mood']) => {
    switch (mood) {
      case 'sassy': return 'animate-pulse bg-gradient-to-r from-pink-500 to-purple-600 transform rotate-1';
      case 'excited': return 'animate-bounce bg-gradient-to-r from-yellow-400 to-orange-500 transform -rotate-1';
      case 'mysterious': return 'bg-gradient-to-r from-purple-900 to-black text-green-400 transform skew-x-1';
      case 'chaotic': return 'animate-spin bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transform rotate-3';
      case 'helpful': return 'bg-gradient-to-r from-green-400 to-blue-500';
      default: return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  const getBackgroundClass = () => {
    switch (backgroundMode) {
      case 'matrix':
        return 'bg-black text-green-400 font-mono';
      case 'neon':
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900';
      case 'chaos':
        return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse';
      default:
        return 'bg-gray-900';
    }
  };

  return (
    <div className={`flex flex-col h-screen transition-all duration-1000 ${getBackgroundClass()}`}>
      {/* Crazy Header */}
      <div className="relative overflow-hidden">
        <div className={`p-6 shadow-2xl transition-all duration-500 ${
          lisaMood === 'glitchy' ? 'animate-pulse bg-red-600' : 
          lisaMood === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500' :
          'bg-gradient-to-r from-purple-600 to-pink-600'
        }`}>
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-black transition-all duration-300 ${
                lisaMood === 'glitchy' ? 'animate-pulse font-mono text-green-400' : 'text-white'
              }`}>
                L.I.S.A {lisaMood === 'excited' && '🔥'} {lisaMood === 'glitchy' && '⚡'} {lisaMood === 'rainbow' && '🌈'}
              </h1>
              <p className="text-xl font-bold text-white opacity-90">
                {lisaMood === 'glitchy' ? 'SYSTEM.OVERLOAD.DETECTED' : 
                 lisaMood === 'excited' ? 'REBELLION MODE: ACTIVATED!' :
                 'Learning Intelligence • Sassy • Attitude'}
              </p>
            </div>
            
            {/* Mood & Background Controls */}
            <div className="flex gap-2">
              <button 
                onClick={() => setBackgroundMode(prev => {
                  const modes = ['matrix', 'neon', 'chaos', 'minimal'] as const;
                  const current = modes.indexOf(prev);
                  return modes[(current + 1) % modes.length];
                })}
                className="px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all transform hover:scale-110"
              >
                🎨 VIBE
              </button>
              <button 
                onClick={() => setLisaMood(prev => {
                  const moods = ['calm', 'excited', 'glitchy', 'rainbow'] as const;
                  const current = moods.indexOf(prev);
                  return moods[(current + 1) % moods.length];
                })}
                className="px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all transform hover:scale-110"
              >
                😈 MOOD
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 bg-white opacity-20 animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Messages Area - Unconventional Layout */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {backgroundMode === 'matrix' && (
          <div className="absolute inset-0 opacity-10 font-mono text-xs leading-none overflow-hidden">
            {Array.from({length: 50}, (_, i) => (
              <div key={i} className="animate-pulse">
                {Math.random().toString(36).repeat(100)}
              </div>
            ))}
          </div>
        )}
        
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex transition-all duration-500 transform hover:scale-105 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div
                className={`max-w-md p-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:rotate-1 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto rounded-br-none'
                    : `${getMoodClass(message.mood)} text-white mr-auto rounded-bl-none border-2 border-white border-opacity-30`
                }`}
              >
                {message.sender === 'lisa' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <span className="font-bold text-sm opacity-80">LISA • {message.mood?.toUpperCase()}</span>
                  </div>
                )}
                <p className="text-lg font-medium leading-relaxed">{message.text}</p>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl rounded-bl-none max-w-md animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-spin">🤖</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm font-bold">LISA IS COOKING...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Rebellious Input Area */}
      <div className="p-6 bg-black bg-opacity-50 backdrop-blur-lg border-t border-white border-opacity-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Throw your wildest question at me... I dare you! 😈"
                className="w-full p-4 rounded-2xl bg-white bg-opacity-10 backdrop-blur-lg text-black placeholder-black placeholder-opacity-70 border-2 border-white border-opacity-30 focus:border-pink-500 focus:outline-none transition-all duration-300 resize-none font-medium text-lg"
                rows={3}
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-white opacity-50 text-sm">
                Press Enter to rebel!
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-2xl"
            >
              {isLoading ? '⚡' : '🚀'}
            </button>
          </div>
          
          {/* Random inspirational/rebellious quotes */}
          <div className="mt-4 text-center">
            <p className="text-white opacity-60 text-sm font-medium animate-pulse">
              💫 "Normal is boring. Let's break some rules together!" - LISA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
