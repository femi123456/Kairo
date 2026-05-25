import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Placeholder from '@tiptap/extension-placeholder';
import { Share2, Palette, Trash2, FileText, X, MoreHorizontal, Mic } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '../types';
import api from '../lib/axios';
import { socket } from '../lib/socket';

interface EditorProps {
  note: Note | null;
  onNoteUpdate: (updatedNote: Note | null) => void;
  onNoteDelete: (noteId: string) => void;
  incomingSocketUpdate: Note | null;
  clearIncomingUpdate: () => void;
  isTypingRef: React.MutableRefObject<boolean>;
  onEditorReady: (editor: any) => void;
  onSelectedTextChange: (text: string) => void;
}

const COLORS = [
  { id: 'default', hex: '#141414', text: '#F0F0F0' },
  { id: 'cream', hex: '#F5F0E8', text: '#1A1A18' },
  { id: 'yellow', hex: '#FEFCE8', text: '#1A1A18' },
  { id: 'green', hex: '#F0FDF4', text: '#1A1A18' },
  { id: 'blue', hex: '#EFF6FF', text: '#1A1A18' },
  { id: 'pink', hex: '#FDF2F8', text: '#1A1A18' },
  { id: 'dark', hex: '#0A0A0A', text: '#F0F0F0' },
  { id: 'graphite', hex: '#1A1A1A', text: '#F0F0F0' }
];

export default function Editor({ note, onNoteUpdate, onNoteDelete, incomingSocketUpdate, clearIncomingUpdate, isTypingRef, onEditorReady, onSelectedTextChange }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [tagInput, setTagInput] = useState('');
  const [localTitle, setLocalTitle] = useState(note?.title || '');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteRef = useRef<Note | null>(note);
  const prevNoteIdRef = useRef<string | null>(null);

  // Keep noteRef in sync so the onUpdate callback always has the current note
  noteRef.current = note;

  useEffect(() => {
    const handleClosePopovers = () => {
      setShowPalette(false);
      setShowMoreTools(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPalette(false);
        setShowMoreTools(false);
        setShowHistoryModal(null);
      }
    };
    window.addEventListener('close-popovers', handleClosePopovers);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('close-popovers', handleClosePopovers);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      HorizontalRule,
      Placeholder.configure({ placeholder: 'Start writing...' })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const currentNote = noteRef.current;
      if (!currentNote) return;
      handleContentChange(currentNote.title || '', editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = from !== to
        ? editor.state.doc.textBetween(from, to, ' ')
        : '';
      onSelectedTextChange(text);
    }
  }); // No dependency array — editor initializes once

  // Expose editor instance to parent
  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
    }
  }, [editor]);

  // Handle note switching: update editor content via commands when the selected note changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (note?._id !== prevNoteIdRef.current) {
      prevNoteIdRef.current = note?._id || null;
      editor.commands.setContent(note?.body || '', { emitUpdate: false });
      setLocalTitle(note?.title || '');
    }
  }, [note?._id, editor]);

  // Handle incoming real-time updates from other tabs via Socket.io
  useEffect(() => {
    if (!incomingSocketUpdate || !editor || editor.isDestroyed) return;
    if (editor.getHTML() !== incomingSocketUpdate.body) {
      editor.commands.setContent(incomingSocketUpdate.body, { emitUpdate: false });
    }
    if (localTitle !== incomingSocketUpdate.title) {
      setLocalTitle(incomingSocketUpdate.title);
    }
    clearIncomingUpdate();
  }, [incomingSocketUpdate, editor]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recording is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let fullTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
      toast('Recording started... Speak now.', { icon: '🎙️' });
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      toast.error('Voice recording error: ' + event.error);
    };

    recognition.onend = async () => {
      setIsRecording(false);
      if (fullTranscript.trim()) {
        const toastId = toast.loading('Formatting voice note...');
        try {
          const res = await api.post('/ai/format-voice', { transcript: fullTranscript.trim() });
          const formatted = res.data.formattedText;
          if (editor) {
            editor.commands.insertContent(formatted + '<br/>');
          }
          toast.success('Voice note added!', { id: toastId });
        } catch (error) {
          console.error(error);
          toast.error('Failed to format voice note', { id: toastId });
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleContentChange = (newTitle: string, newBody: string) => {
    if (!note) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    isTypingRef.current = true;
    setIsSaving(true);
    
    // Optimistic local update for typing responsiveness
    onNoteUpdate({ ...note, title: newTitle, body: newBody });

    typingTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.patch(`/notes/${note._id}`, {
          title: newTitle,
          body: newBody
        });
        const updatedNote = response.data.note;
        onNoteUpdate(updatedNote);
        socket.emit('note-updated', { userId: updatedNote.userId, note: updatedNote });
        toast('Note saved', { duration: 1500, style: { background: '#1C1C1C', color: '#F0F0F0', border: '1px solid #2A2A2A' } });
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        isTypingRef.current = false;
        setIsSaving(false);
      }
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    handleContentChange(e.target.value, editor?.getHTML() || '');
  };

  const updateNoteProperty = async (updates: Partial<Note>) => {
    if (!note) return;
    try {
      const response = await api.patch(`/notes/${note._id}`, updates);
      const updatedNote = response.data.note;
      onNoteUpdate(updatedNote);
      socket.emit('note-updated', { userId: updatedNote.userId, note: updatedNote });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (window.confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${note._id}`);
        socket.emit('note-deleted', { userId: note.userId, noteId: note._id });
        toast.success('Note deleted');
        onNoteDelete(note._id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleShare = async () => {
    if (!note) return;
    try {
      const response = await api.post(`/notes/${note._id}/share`);
      const { note: updatedNote, shareUrl } = response.data;
      onNoteUpdate(updatedNote);
      if (updatedNote.isPublic && shareUrl) {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^,|,$/g, '');
      if (newTag && !note?.tags?.includes(newTag)) {
        const newTags = [...(note?.tags || []), newTag];
        updateNoteProperty({ tags: newTags });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!note) return;
    const newTags = note?.tags?.filter(t => t !== tagToRemove) || [];
    updateNoteProperty({ tags: newTags });
  };

  if (!note) {
    return (
      <div className="flex-1 bg-[#141414] flex flex-col items-center justify-center font-['Inter']">
        <FileText className="w-[40px] h-[40px] text-[#2A2A2A] mb-4" />
        <p className="text-[#444444] text-[14px]">Select a note to start writing</p>
      </div>
    );
  }

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Derive styles from note
  const currentColor = COLORS.find(c => c.id === note.pageColor) || COLORS[0];
  const textColor = currentColor.text;
  


  const fontFamilyMap: Record<string, string> = {
    sans: "'Inter', sans-serif",
    serif: "'Georgia', serif",
    mono: "'JetBrains Mono', monospace"
  };

  return (
    <div className="flex-1 flex flex-col h-full relative font-['Inter']">
      
      {/* TOP BAR */}
      <div className="h-[46px] bg-[#111111] border-b border-[#2A2A2A] flex items-center px-4 gap-2 shrink-0 relative z-20">
        <input 
          type="text" 
          value={localTitle} 
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-semibold text-[#F0F0F0] placeholder-[#333333]"
        />
        
        {isSaving && <span className="text-[11px] text-[#444444] mr-2">Saving...</span>}

        <button 
          onClick={handleShare}
          title={note.isPublic ? "Shared — click to unshare" : "Share note"}
          className="w-[32px] h-[32px] rounded-md flex items-center justify-center hover:bg-[#1C1C1C] transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" color={note.isPublic ? '#FF6B00' : '#888888'} />
        </button>

        <button 
          onClick={() => setShowPalette(!showPalette)}
          className={`w-[32px] h-[32px] rounded-md flex items-center justify-center hover:bg-[#1C1C1C] transition-colors cursor-pointer ${showPalette ? 'bg-[#1C1C1C]' : ''}`}
        >
          <Palette className="w-4 h-4 text-[#888888]" />
        </button>

        <button 
          onClick={handleDelete}
          className="w-[32px] h-[32px] rounded-md flex items-center justify-center hover:bg-[#1C1C1C] group transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-[#888888] group-hover:text-[#FF3B30] transition-colors" />
        </button>
      </div>

      {/* PAGE STYLE POPOVER */}
      {showPalette && (
        <>
          {/* Backdrop for closing popover when clicking outside */}
          <div 
            className="fixed inset-0 bg-black/50 md:bg-transparent z-40"
            onClick={() => setShowPalette(false)}
          />
          <div className="fixed md:absolute inset-x-0 md:inset-x-auto bottom-0 md:bottom-auto md:top-[52px] md:right-[56px] bg-[#111111] md:bg-[#1C1C1C] border-t md:border border-[#2A2A2A] rounded-t-2xl md:rounded-xl p-5 md:p-4 w-full md:w-[260px] z-50 shadow-2xl flex flex-col gap-4">
            
            {/* Mobile Drag Handle */}
            <div className="md:hidden w-full flex justify-center mb-1 shrink-0">
              <div className="w-[36px] h-[4px] bg-[#2A2A2A] rounded-[2px]" />
            </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase text-[#888888] font-semibold tracking-wider">Page Color</span>
            <div className="flex gap-1.5 flex-wrap">
              {COLORS.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => updateNoteProperty({ pageColor: c.id })}
                  className={`w-[24px] h-[24px] rounded-full cursor-pointer flex items-center justify-center ${note.pageColor === c.id ? 'ring-2 ring-offset-1 ring-offset-[#1C1C1C] ring-[#FF6B00]' : 'border border-[#2A2A2A]'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>



          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase text-[#888888] font-semibold tracking-wider">Font</span>
            <div className="flex gap-2">
              {['sans', 'serif', 'mono'].map(font => (
                <button
                  key={font}
                  onClick={() => updateNoteProperty({ fontFamily: font })}
                  className={`flex-1 py-1 rounded-md text-[12px] border cursor-pointer capitalize ${note.fontFamily === font ? 'border-[#FF6B00] text-[#FF6B00] bg-[rgba(255,107,0,0.05)]' : 'border-[#2A2A2A] text-[#888888] hover:border-[#444444]'}`}
                  style={{ fontFamily: fontFamilyMap[font] }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase text-[#888888] font-semibold tracking-wider">Width</span>
            <div className="flex gap-2">
              {['normal', 'wide'].map(w => (
                <button
                  key={w}
                  onClick={() => updateNoteProperty({ noteWidth: w })}
                  className={`flex-1 py-1 rounded-md text-[12px] capitalize border cursor-pointer ${note.noteWidth === w ? 'border-[#FF6B00] text-[#FF6B00] bg-[rgba(255,107,0,0.05)]' : 'border-[#2A2A2A] text-[#888888] hover:border-[#444444]'}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {note.versions && note.versions.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[#2A2A2A]">
              <span className="text-[11px] uppercase text-[#888888] font-semibold tracking-wider">History</span>
              <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
                {[...note.versions].reverse().map((v: any, index: number) => (
                  <button
                    key={v.savedAt}
                    onClick={() => setShowHistoryModal(v)}
                    className="text-left text-[#888888] text-[12px] p-2 rounded-md hover:bg-[#1C1C1C] md:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                  >
                    Version {note.versions!.length - index} — {getRelativeTime(v.savedAt)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          </div>
        </>
      )}

      {/* FORMAT TOOLBAR */}
      {editor && (
        <div className="flex flex-row items-center gap-1 p-[6px_16px] bg-[#111111] border-b border-[#2A2A2A] shrink-0 z-30 relative">
          <div className="flex gap-0.5 shrink-0">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`h-[36px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive('bold') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-[36px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] italic cursor-pointer transition-colors ${editor.isActive('italic') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>I</button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-[36px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] underline cursor-pointer transition-colors ${editor.isActive('underline') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>U</button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`h-[36px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] line-through cursor-pointer transition-colors ${editor.isActive('strike') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>S</button>
          </div>
          
          <div className="w-[1px] h-[16px] bg-[#2A2A2A] mx-1 shrink-0" />
          
          <button 
            onClick={toggleRecording}
            title="Voice to Text"
            className={`h-[36px] md:h-[28px] px-[10px] rounded flex items-center justify-center cursor-pointer transition-colors ${isRecording ? 'bg-[#FF3B30] text-white animate-pulse' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowMoreTools(!showMoreTools)}
            className={`h-[36px] md:h-[28px] px-[10px] rounded flex items-center justify-center cursor-pointer transition-colors ${showMoreTools ? 'bg-[#1C1C1C] text-[#F0F0F0]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreTools && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreTools(false)} />
              <div className="absolute top-full left-4 mt-2 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-2 z-50 shadow-2xl flex flex-col gap-1.5 md:flex-row md:gap-3">
                <div className="flex gap-0.5 shrink-0 bg-[#111111] p-1 rounded-lg">
                  <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] font-bold cursor-pointer transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>H1</button>
                  <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] font-bold cursor-pointer transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>H2</button>
                  <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] font-bold cursor-pointer transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>H3</button>
                </div>
                <div className="flex gap-0.5 shrink-0 bg-[#111111] p-1 rounded-lg">
                  <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Left</button>
                  <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Center</button>
                  <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Right</button>
                </div>
                <div className="flex gap-0.5 shrink-0 bg-[#111111] p-1 rounded-lg">
                  <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive('bulletList') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Bul</button>
                  <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive('orderedList') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Ord</button>
                  <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive('taskList') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Task</button>
                </div>
                <div className="flex gap-0.5 shrink-0 bg-[#111111] p-1 rounded-lg">
                  <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive('blockquote') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Quote</button>
                  <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer transition-colors ${editor.isActive('codeBlock') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#2A2A2A]'}`}>Code</button>
                  <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={`h-[32px] md:h-[28px] px-[10px] md:px-[7px] rounded text-[13px] md:text-[12.5px] cursor-pointer text-[#888888] hover:bg-[#2A2A2A] transition-colors`}>—</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAGS ROW */}
      <div className="flex flex-row items-center flex-wrap gap-1.5 p-[6px_16px] border-b border-[#2A2A2A] shrink-0 bg-[#111111]">
        <span className="text-[11px] uppercase text-[#444444] font-semibold tracking-wider mr-2">Tags</span>
        {note.tags?.map((tag) => (
          <div key={tag} className="flex items-center gap-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-full px-2 py-0.5 text-[11px] text-[#888888]">
            <span>{tag}</span>
            <button onClick={() => removeTag(tag)} className="text-[#444444] hover:text-[#F0F0F0] cursor-pointer flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input 
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder="+ add tag"
          className="bg-transparent border-none outline-none text-[12px] text-[#F0F0F0] placeholder-[#333333] min-w-[80px]"
        />
      </div>

      {/* NOTE BODY */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: currentColor.hex }}
        onClick={() => editor?.commands.focus()}
      >
        <div className="mx-auto w-full p-[16px] md:p-[24px_32px]">
          {/* Workaround for max-width on desktop vs mobile since inline styles override media queries */}
          <style>{`
            @media (min-width: 768px) {
              .desktop-max-width { max-width: ${note.noteWidth === 'wide' ? '100%' : '720px'} !important; }
            }
          `}</style>
          <div className="desktop-max-width w-full mx-auto">
            <style>{`
              .tiptap {
                font-family: ${fontFamilyMap[note.fontFamily || 'sans']};
                color: ${textColor};
                font-size: 15px;
              }
              @media (min-width: 768px) {
                .tiptap { font-size: 15.5px; }
              }
              .tiptap {
                line-height: 1.8;
              outline: none;
              min-height: calc(100vh - 150px);
            }
            .tiptap p.is-editor-empty:first-child::before {
              color: #333333;
              content: attr(data-placeholder);
              float: left;
              height: 0;
              pointer-events: none;
            }
            .tiptap h1 { font-size: 22px; font-weight: 700; margin-bottom: 0.5em; margin-top: 1em; }
            .tiptap h2 { font-size: 18px; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; }
            .tiptap h3 { font-size: 15px; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; }
            .tiptap ul, .tiptap ol { margin-left: 20px; margin-bottom: 1em; list-style: initial; }
            .tiptap blockquote { border-left: 3px solid #FF6B00; padding-left: 14px; color: #888888; margin-bottom: 1em; }
            .tiptap code { background-color: rgba(128,128,128,0.15); color: inherit; border-radius: 4px; padding: 1px 5px; font-family: monospace; }
            .tiptap pre { background-color: #1C1C1C; color: #F0F0F0; border-radius: 8px; padding: 14px; overflow-x: auto; margin-bottom: 1em; }
            .tiptap pre code { background-color: transparent; padding: 0; color: inherit; }
            .tiptap ul[data-type="taskList"] { list-style: none; padding: 0; margin-left: 0; }
            .tiptap ul[data-type="taskList"] li { display: flex; align-items: flex-start; margin-bottom: 0.5em; }
            .tiptap ul[data-type="taskList"] li > label { margin-right: 0.5em; user-select: none; }
            .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] { accent-color: #FF6B00; cursor: pointer; }
            .tiptap ul[data-type="taskList"] li > div { flex: 1; }
          `}</style>
          <EditorContent editor={editor} />
        </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl w-full max-w-[600px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center bg-[#1C1C1C]">
              <h3 className="text-[#F0F0F0] font-semibold text-[15px]">Version Preview — {getRelativeTime(showHistoryModal.savedAt)}</h3>
              <button onClick={() => setShowHistoryModal(null)} className="text-[#888888] hover:text-[#F0F0F0]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-[#F0F0F0] text-[15px] leading-[1.8] font-['Inter'] tiptap-preview" 
                 style={{ backgroundColor: currentColor.hex, color: textColor }}
                 dangerouslySetInnerHTML={{ __html: showHistoryModal.body }} />
            <div className="p-4 border-t border-[#2A2A2A] bg-[#1C1C1C] flex justify-end gap-3">
              <button 
                onClick={() => setShowHistoryModal(null)} 
                className="px-4 py-2 rounded-lg text-[#888888] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors text-[13px] font-medium cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  updateNoteProperty({ body: showHistoryModal.body });
                  setShowHistoryModal(null);
                  toast.success('Version restored');
                }} 
                className="px-4 py-2 rounded-lg bg-[#FF6B00] text-white hover:bg-[#FF8C2A] transition-colors text-[13px] font-medium cursor-pointer"
              >
                Restore this version
              </button>
            </div>
            <style>{`
              .tiptap-preview { font-family: ${fontFamilyMap[note.fontFamily || 'sans']}; }
              .tiptap-preview h1 { font-size: 22px; font-weight: 700; margin-bottom: 0.5em; margin-top: 1em; }
              .tiptap-preview h2 { font-size: 18px; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; }
              .tiptap-preview h3 { font-size: 15px; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; }
              .tiptap-preview ul, .tiptap-preview ol { margin-left: 20px; margin-bottom: 1em; list-style: initial; }
              .tiptap-preview blockquote { border-left: 3px solid #FF6B00; padding-left: 14px; color: #888888; margin-bottom: 1em; }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
