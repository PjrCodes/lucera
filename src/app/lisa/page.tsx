'use client';

import { useState, useRef, useEffect } from 'react';

// Lucera color palette
const LUCERA = {
  yellow: 'bg-[#FEE085] text-[#7a5c00]',
  blue: 'bg-[#4FCBDB] text-[#0a3a43]',
  red: 'bg-[#FE6D6D] text-[#7a2323]',
  rose: 'bg-[#F83E85] text-[#6d1b3a]',
  brown: 'bg-[#C79092] text-[#4e2a2b]',
  green: 'bg-[#3ec300] text-[#173d00]',
  gray: 'bg-[#697480] text-[#23272e]',
  offwhite: 'bg-[#D4D4D4] text-[#23272e]',
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lisa';
  timestamp: Date;
  type?: 'book' | 'letter' | 'info';
}

function ChatHeader() {
  return (
    <header className="w-full border-b bg-[#FEE085]">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label="books">📚</span>
        <div>
          <h1 className="text-lg font-bold text-[#7a5c00] tracking-tight">LISA</h1>
          <p className="text-xs text-[#7a5c00]">Learning Intelligence Study Assistant</p>
        </div>
      </div>
    </header>
  );
}

function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-[#FEE085]/30">
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-xl px-4 py-3 max-w-[80%] shadow
                ${message.sender === 'user'
                  ? 'bg-[#4FCBDB] text-[#0a3a43] rounded-br-sm'
                  : message.type === 'book'
                    ? 'bg-[#FEE085] text-[#7a5c00] rounded-bl-sm flex items-center gap-2'
                    : message.type === 'letter'
                      ? 'bg-[#C79092] text-[#4e2a2b] rounded-bl-sm flex items-center gap-2'
                      : 'bg-white text-[#23272e] rounded-bl-sm'
                }`}
            >
              {message.sender === 'lisa' && message.type === 'book' && (
                <span className="text-xl mr-2" role="img" aria-label="book">📖</span>
              )}
              {message.sender === 'lisa' && message.type === 'letter' && (
                <span className="text-xl mr-2" role="img" aria-label="letter">✉️</span>
              )}
              <span className="break-words whitespace-pre-line text-base">
                {message.text}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="w-full border-t bg-white px-4 py-3">
      <form
        className="max-w-2xl mx-auto flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <textarea
          className="flex-1 rounded-lg border border-[#FEE085] px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#4FCBDB] bg-[#FEE085]/20"
          rows={2}
          placeholder="Type your question... (You can use emoji! 📚✉️)"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={disabled}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg font-semibold bg-[#4FCBDB] text-[#0a3a43] hover:bg-[#FEE085] hover:text-[#7a5c00] transition-colors disabled:opacity-60"
          disabled={disabled || !input.trim()}
        >
          <span role="img" aria-label="send">📨</span>
        </button>
      </form>
    </div>
  );
}

export default function LisaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm LISA, your study assistant. Ask me anything about your lessons. 📚",
      sender: 'lisa',
      timestamp: new Date(),
      type: 'book'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (msg: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: msg,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate LISA's educational response
    setTimeout(() => {
      // Pick a type for variety
      const types: Message['type'][] = ['book', 'letter', 'info'];
      const type = types[Math.floor(Math.random() * types.length)];
      let text = '';
      if (type === 'book') {
        text = "Here's a helpful explanation from your textbook! 📖\n\nLearning is a journey, and I'm here to guide you step by step.";
      } else if (type === 'letter') {
        text = "You've got educational mail! ✉️\n\nWould you like some practice questions or a summary?";
      } else {
        text = "Let me help you with that! If you need more details, just ask. 😊";
      }
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'lisa',
        timestamp: new Date(),
        type
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FEE085]/30">
      <ChatHeader />
      <MessageList messages={messages} />
      {isLoading && (
        <div className="max-w-2xl mx-auto px-4 py-2 text-center text-[#697480] flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="books">📚</span>
          <span>Thinking...</span>
        </div>
      )}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
