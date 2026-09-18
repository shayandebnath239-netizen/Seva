import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext.tsx';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';

type Message = {
  role: 'user' | 'assistant' | 'error';
  content: string;
};

export function AskSeva() {
  const { user, signIn, getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Namaste. I am SEVA, your grounded assistant for discovering verified Indian government services. Tell me what you are looking for, or share your state and education level to find relevant schemes.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query: userQuery, history: messages.filter(m => m.role !== 'error') })
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Invalid response from server: ${text.substring(0, 50)}...`);
      }
      
      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Network response was not ok');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Ask SEVA Error:', error);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: 'SEVA AI is temporarily unavailable. You can still browse verified government services and official links.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ask SEVA</h1>
          <p className="text-sm text-neutral-500">Grounded government-information assistant</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium self-start md:self-auto">
          <AlertCircle className="w-3.5 h-3.5" />
          Always verify on official portals
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="shrink-0 mt-1">
              {msg.role === 'user' ? (
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-neutral-500" />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${msg.role === 'error' ? 'bg-red-500' : 'bg-orange-600'}`}>
                  S
                </div>
              )}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-sm' 
                : msg.role === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-sm'
                  : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="markdown-body text-sm md:text-base prose prose-neutral max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 flex-row">
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">
                S
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center justify-center h-12 w-16">
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-neutral-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="e.g. I need a scholarship for higher education in Maharashtra..."
              className="w-full bg-neutral-100 border-0 rounded-2xl pl-4 pr-12 py-3 md:py-4 focus:ring-2 focus:ring-orange-600 resize-none max-h-32 text-neutral-900"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6 ml-1" />
          </button>
        </form>
        <div className="text-center mt-2 text-xs text-neutral-400">
          SEVA can make mistakes. Check important info on official portals.
        </div>
      </div>
    </div>
  );
}
