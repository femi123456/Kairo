import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Bot, Send, TextSelect } from 'lucide-react';
import { toast } from 'sonner';
import type { Note, Message } from '../types';
import type { Editor } from '@tiptap/react';

interface KairoAIProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onNoteUpdate?: (updatedNote: Note) => void;
  editor: Editor | null;
  selectedText: string;
}

const EMPTY_PROMPTS = [
  'Help me start this note',
  'Suggest an outline',
  'What should I write about?',
  'Give me an intro paragraph',
];

const CONTENT_PROMPTS = [
  'Summarize this note',
  'Improve the writing',
  'Fix grammar',
  'Generate 3 ideas',
  'Turn into bullet points',
];

function applyInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>');
}

function convertMarkdownToHTML(text: string): string {
  const blocks = text.split(/\n\n+/);
  const converted = blocks.map(block => {
    const lines = block.split('\n').filter(l => l.trim());
    if (lines.length === 0) return '';

    // Check for unordered list
    if (lines.every(l => /^\s*[-*]\s/.test(l))) {
      const items = lines.map(l => `<li>${applyInlineFormatting(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }

    // Check for ordered list
    if (lines.every(l => /^\s*\d+\.\s/.test(l))) {
      const items = lines.map(l => `<li>${applyInlineFormatting(l.replace(/^\s*\d+\.\s+/, ''))}</li>`).join('');
      return `<ol>${items}</ol>`;
    }

    // Single line blocks
    if (lines.length === 1) {
      const line = lines[0];
      if (line.startsWith('### ')) return `<h3>${applyInlineFormatting(line.slice(4))}</h3>`;
      if (line.startsWith('## ')) return `<h2>${applyInlineFormatting(line.slice(3))}</h2>`;
      if (line.startsWith('# ')) return `<h1>${applyInlineFormatting(line.slice(2))}</h1>`;
    }

    // Default: paragraph
    return `<p>${applyInlineFormatting(lines.join(' '))}</p>`;
  });

  return converted.filter(Boolean).join('');
}

export default function KairoAI({ note, isOpen, onClose, editor, selectedText }: KairoAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevNoteIdRef = useRef<string | null>(null);

  const hasContent = note ? note.body.replace(/<[^>]+>/g, '').trim().length > 0 : false;
  const quickPrompts = hasContent ? CONTENT_PROMPTS : EMPTY_PROMPTS;

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
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('kairo_token');

      const response = await fetch(`${apiUrl}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text.trim(),
          noteContext: {
            title: note.title,
            body: note.body,
            tags: note.tags,
            selectedText: selectedText || '',
          },
          history,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

      // Add empty AI message that we'll stream into
      const aiMessageIndex = messages.length + 1; // +1 for the user message we just added
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          if (data === '[ERROR]') {
            setMessages(prev => {
              const updated = [...prev];
              updated[aiMessageIndex] = { role: 'assistant', content: 'Kairo AI encountered an error' };
              return updated;
            });
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              setMessages(prev => {
                const updated = [...prev];
                const msg = updated[aiMessageIndex];
                if (msg) {
                  updated[aiMessageIndex] = { ...msg, content: msg.content + parsed.token };
                }
                return updated;
              });
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch (error) {
      console.error('AI stream error:', error);
      setMessages(prev => {
        // If last message is an empty AI message from failed stream, update it
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          return [...prev.slice(0, -1), { role: 'assistant' as const, content: 'Kairo AI is unavailable right now' }];
        }
        return [...prev, { role: 'assistant' as const, content: 'Kairo AI is unavailable right now' }];
      });
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

  const insertIntoNote = (content: string) => {
    if (!editor || editor.isDestroyed) return;
    const html = convertMarkdownToHTML(content);
    editor.commands.focus('end');
    editor.commands.insertContent('<hr>' + html);
    toast.success('Added to note');
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
            {quickPrompts.map((prompt) => (
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
                    {msg.content || (isLoading && i === messages.length - 1 ? (
                      <span className="flex items-center gap-1.5">
                        <style>{`
                          @keyframes kairo-bounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-4px); }
                          }
                        `}</style>
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="inline-block w-[6px] h-[6px] rounded-full bg-[#444444]"
                            style={{
                              animation: `kairo-bounce 0.8s ease-in-out infinite`,
                              animationDelay: `${delay}ms`,
                            }}
                          />
                        ))}
                      </span>
                    ) : '')}
                  </div>
                  {msg.role === 'assistant' && msg.content && msg.content !== 'Kairo AI is unavailable right now' && msg.content !== 'Kairo AI encountered an error' && (
                    <button
                      onClick={() => insertIntoNote(msg.content)}
                      className="text-[11px] text-[#FF6B00] bg-transparent border-none cursor-pointer py-1 hover:underline"
                    >
                      Insert into note
                    </button>
                  )}
                </div>
              ))}

              {/* Typing indicator — only shown before streaming message is added */}
              {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role !== 'assistant') && (
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

        {/* SELECTED TEXT INDICATOR */}
        {selectedText && (
          <div
            className="flex items-center gap-1.5 mx-[10px] mb-[6px] px-[10px] py-[4px] rounded-[6px]"
            style={{ fontSize: '11px', color: '#FF6B00', background: 'rgba(255,107,0,0.08)' }}
          >
            <TextSelect className="w-3 h-3 shrink-0" />
            <span>Asking about selected text</span>
          </div>
        )}

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
