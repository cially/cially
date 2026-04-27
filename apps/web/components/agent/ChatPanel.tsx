'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Bot, Send, Brain, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentChat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Helper to render text with <think> tag support
  const renderContent = (text: string) => {
    if (!text.includes('<think>')) return <div className="whitespace-pre-wrap break-words">{text}</div>;

    const parts = text.split(/(<think>[\s\S]*?(?:<\/think>|$))/g);

    return parts.map((part, i) => {
      if (part.startsWith('<think>')) {
        const content = part.replace('<think>', '').replace('</think>', '').trim();
        if (!content) return null;
        return (
          <details key={i} className="mb-1 text-white/30 italic text-xs border-l border-white/10 pl-3 group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center gap-1.5 opacity-50 non-italic not-italic font-bold uppercase tracking-widest text-[9px] cursor-pointer list-none select-none outline-none">
              <Brain size={10} />
              Reasoning
              <ChevronDown size={10} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="whitespace-pre-wrap break-words mt-1 cursor-text">{content}</div>
          </details>
        );
      }
      const textContent = part.replace(/^\s+/, '');
      if (!textContent) return null;
      return <div key={i} className="whitespace-pre-wrap break-words">{textContent}</div>;
    });
  };

  // Improved scrolling logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior
        });
      }
    }
  };

  // Handle scroll events to detect if user is at bottom
  const handleScroll = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const atBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsAtBottom(atBottom);
      }
    }
  };

  // Auto-scroll when messages update, but only if we were already at the bottom
  useEffect(() => {
    if (isAtBottom) {
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => scrollToBottom(isLoading ? 'auto' : 'smooth'));
    }
  }, [messages, isLoading, isAtBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
    setIsAtBottom(true); // Reset to bottom on new message
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-140px)] max-w-5xl mx-auto px-2 sm:px-0">
      <Card className="flex-1 flex flex-col min-h-0 border-white/10 bg-transparent backdrop-blur-sm shadow-none overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea
            ref={scrollRef}
            className="flex-1 min-h-0"
            onScroll={handleScroll}
          >
            <div className="flex flex-col gap-8 max-w-4xl mx-auto px-4 py-8">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 opacity-20">
                  <Bot size={64} strokeWidth={1} />
                  <p className="mt-4 text-sm font-light tracking-widest uppercase">No active session</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col max-w-[95%] sm:max-w-[85%]",
                    message.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all",
                    message.role === 'user'
                      ? "bg-white/10 text-white border border-white/10 shadow-sm"
                      : "bg-transparent border border-white/5 text-white/70"
                  )}>
                    {message.parts.map((part, i) => (
                      part.type === 'text' && (
                        <div key={`${message.id}-${i}`}>
                          {renderContent(part.text)}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start max-w-[80%] animate-pulse">
                  <div className="px-4 py-3 rounded-2xl bg-transparent border border-white/5 flex gap-1.5 items-center h-10">
                    <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-4 pb-4 pt-2 shrink-0 bg-transparent">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center max-w-4xl mx-auto w-full">
              <Input
                className="bg-transparent border-white/10 focus:border-white/20 h-11 rounded-xl transition-all placeholder:text-white/20"
                value={input}
                placeholder="Message your agent..."
                onChange={e => setInput(e.currentTarget.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-11 px-5 border-white/10 hover:bg-white/5 text-white/80 transition-all rounded-xl flex items-center gap-2"
                variant="outline"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
