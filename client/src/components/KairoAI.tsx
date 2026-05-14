import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Bot, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { Note, Message } from '../types';
import api from '../lib/axios';
import { socket } from '../lib/socket';

interface KairoAIProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onNoteUpdate?: (updatedNote: Note) => void;
}

const QUICK_PROMPTS = [
  'Summarize this note',
  'Improve the writing',
  'Fix grammar',
  'Generate 3 ideas',
  'Turn into bullet points',
];

export default function KairoAI({ note, isOpen, onClose, onNoteUpdate }: KairoAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevNoteIdRef = useRef<string | null>(null);

  // Reset messages when note changes
  useEffect(() => {
    if (note?._id !== prevNoteIdRef.current) {
      setMessages([]);
      setInput('');
      prevNoteIdRef.current = note?._id || null;
    }
  }, [note?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !note || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].slice(-10);
      const response = await api.post('/ai', {
        message: text.trim(),
        noteContext: {
          title: note.title,
          body: note.body,
          tags: note.tags,
        },
        history,
      });

      const aiMessage: Message = { role: 'assistant', content: response.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Kairo AI is unavailable right now',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const insertIntoNote = async (content: string) => {
    if (!note) return;
    try {
      const newBody = note.body + `<p>${content}</p>`;
      const response = await api.patch(`/notes/${note._id}`, { body: newBody });
      const updatedNote = response.data.note;
      if (onNoteUpdate) onNoteUpdate(updatedNote);
      socket.emit('note-updated', updatedNote);
      toast.success('Added to note');
    } catch (error) {
      console.error('Insert failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:relative inset-x-0 bottom-0 md:inset-auto z-50 md:z-0 shrink-0 overflow-hidden transition-all duration-300 md:duration-200 ease-in-out bg-[#111111] rounded-t-2xl md:rounded-none border-t md:border-t-0 md:border-l border-[#2A2A2A]
          ${isOpen ? 'h-[65vh] md:h-full w-full md:w-[320px]' : 'h-0 md:h-full md:w-0'}`}
      >
        <div className="h-full w-full md:w-[320px] flex flex-col relative">

          {/* Mobile Drag Handle */}
          <div className="md:hidden w-full pt-4 pb-2 flex justify-center shrink-0">
            <div className="w-[36px] h-[4px] bg-[#2A2A2A] rounded-[2px]" />
          </div>

          {/* HEADER */}
          <div className="h-[46px] px-[14px] border-b border-[#2A2A2A] flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-[#FF6B00]" />
          <span className="text-[14px] font-medium text-[#F0F0F0] flex-1">Kairo AI</span>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] rounded-md flex items-center justify-center hover:bg-[#1C1C1C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#888888]" />
          </button>
        </div>

        {/* QUICK PROMPTS */}
        <div className="p-[10px] border-b border-[#2A2A2A] shrink-0">
          <span className="text-[11px] uppercase text-[#444444] font-semibold tracking-wider block mb-2">
            Try asking
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading || !note}
                className="text-[11px] px-[10px] py-[4px] rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-[#888888] cursor-pointer hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
          {messages.length === 0 && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Bot className="w-7 h-7 text-[#333333]" />
              <p className="text-[#444444] text-[13px] text-center">
                Ask Kairo AI anything about your note
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={
                      msg.role === 'user'
                        ? 'max-w-[85%] bg-[#FF6B00] text-white rounded-[12px_12px_3px_12px] px-3 py-[9px] text-[13px] leading-relaxed'
                        : 'max-w-[90%] bg-[#1C1C1C] text-[#F0F0F0] border border-[#2A2A2A] rounded-[12px_12px_12px_3px] px-3 py-[9px] text-[13px] leading-relaxed whitespace-pre-wrap'
                    }
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && msg.content !== 'Kairo AI is unavailable right now' && (
                    <button
                      onClick={() => insertIntoNote(msg.content)}
                      className="text-[11px] text-[#FF6B00] bg-transparent border-none cursor-pointer py-1 hover:underline"
                    >
                      Insert into note
                    </button>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="self-start max-w-[90%] bg-[#1C1C1C] border border-[#2A2A2A] rounded-[12px_12px_12px_3px] px-3 py-[9px] flex items-center gap-1.5">
                  <style>{`
                    @keyframes kairo-bounce {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-4px); }
                    }
                  `}</style>
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-[6px] h-[6px] rounded-full bg-[#444444]"
                      style={{
                        animation: `kairo-bounce 0.8s ease-in-out infinite`,
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT ROW */}
        <div className="p-[10px] border-t border-[#2A2A2A] flex gap-2 shrink-0">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Kairo AI..."
            rows={1}
            className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-[10px] py-2 text-[13px] text-[#F0F0F0] placeholder-[#333333] resize-none outline-none focus:border-[#FF6B00] transition-colors"
            style={{ minHeight: '36px', maxHeight: '100px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || !note}
            className="w-[36px] h-[36px] bg-[#FF6B00] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#FF8C2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-[15px] h-[15px] text-white" />
          </button>
        </div>

      </div>
      </div>
    </>
  );
}
