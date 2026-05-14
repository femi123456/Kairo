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
import { Share2, Palette, Trash2, FileText, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '../types';
import api from '../lib/axios';
import { socket } from '../lib/socket';

interface EditorProps {
  note: Note | null;
  onNoteUpdate: (updatedNote: Note | null) => void;
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

export default function Editor({ note, onNoteUpdate }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    content: note?.body || '',
    onUpdate: ({ editor }) => {
      handleContentChange(note?.title || '', editor.getHTML());
    }
  }, [note?._id]); // Re-initialize when note changes

  // Update editor content when switching notes or when external updates happen (like AI insertion)
  useEffect(() => {
    if (editor && !editor.isDestroyed && note) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== note.body) {
        editor.commands.setContent(note.body || '');
      }
    }
  }, [note?._id, note?.body, editor]);

  const handleContentChange = (newTitle: string, newBody: string) => {
    if (!note) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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
        socket.emit('note-updated', updatedNote);
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleContentChange(e.target.value, editor?.getHTML() || '');
  };

  const updateNoteProperty = async (updates: Partial<Note>) => {
    if (!note) return;
    try {
      const response = await api.patch(`/notes/${note._id}`, updates);
      const updatedNote = response.data.note;
      onNoteUpdate(updatedNote);
      socket.emit('note-updated', updatedNote);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (window.confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${note._id}`);
        socket.emit('note-deleted', note._id);
        onNoteUpdate(null);
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

  // Derive styles from note
  const currentColor = COLORS.find(c => c.id === note.pageColor) || COLORS[0];
  const isLightPage = !['default', 'dark', 'graphite'].includes(currentColor.id);
  const textColor = currentColor.text;
  
  let bgImage = 'none';
  const lineStr = isLightPage ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
  if (note.paperStyle === 'lined') {
    bgImage = `repeating-linear-gradient(transparent, transparent 27px, ${lineStr} 27px, ${lineStr} 28px)`;
  } else if (note.paperStyle === 'grid') {
    bgImage = `repeating-linear-gradient(transparent, transparent 27px, ${lineStr} 27px, ${lineStr} 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, ${lineStr} 27px, ${lineStr} 28px)`;
  } else if (note.paperStyle === 'dotted') {
    bgImage = `radial-gradient(${lineStr} 1px, transparent 1px)`;
  }

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
          value={note.title} 
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
        <div className="absolute top-[52px] right-4 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-4 w-[260px] z-50 shadow-2xl flex flex-col gap-4">
          
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
            <span className="text-[11px] uppercase text-[#888888] font-semibold tracking-wider">Paper Style</span>
            <div className="grid grid-cols-4 gap-2">
              {['blank', 'lined', 'grid', 'dotted'].map(style => (
                <div 
                  key={style}
                  onClick={() => updateNoteProperty({ paperStyle: style })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer border ${note.paperStyle === style ? 'border-[#FF6B00] bg-[rgba(255,107,0,0.05)]' : 'border-[#2A2A2A] hover:border-[#444444]'}`}
                >
                  <div className="text-[10px] capitalize text-[#888888]">{style}</div>
                </div>
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
          
        </div>
      )}

      {/* FORMAT TOOLBAR */}
      {editor && (
        <div className="flex flex-row flex-wrap items-center gap-1 p-[6px_16px] bg-[#111111] border-b border-[#2A2A2A] shrink-0 z-10">
          <div className="flex gap-0.5">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive('bold') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] italic cursor-pointer transition-colors ${editor.isActive('italic') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>I</button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] underline cursor-pointer transition-colors ${editor.isActive('underline') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>U</button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] line-through cursor-pointer transition-colors ${editor.isActive('strike') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>S</button>
          </div>
          <div className="w-[1px] h-[16px] bg-[#2A2A2A] mx-1" />
          <div className="flex gap-0.5">
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`h-[28px] px-[7px] rounded text-[12.5px] font-bold cursor-pointer transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>H1</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`h-[28px] px-[7px] rounded text-[12.5px] font-bold cursor-pointer transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`h-[28px] px-[7px] rounded text-[12.5px] font-bold cursor-pointer transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>H3</button>
          </div>
          <div className="w-[1px] h-[16px] bg-[#2A2A2A] mx-1" />
          <div className="flex gap-0.5">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Left</button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Center</button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Right</button>
          </div>
          <div className="w-[1px] h-[16px] bg-[#2A2A2A] mx-1" />
          <div className="flex gap-0.5">
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive('bulletList') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Bul</button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive('orderedList') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Ord</button>
            <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive('taskList') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Task</button>
          </div>
          <div className="w-[1px] h-[16px] bg-[#2A2A2A] mx-1" />
          <div className="flex gap-0.5">
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive('blockquote') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Quote</button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer transition-colors ${editor.isActive('codeBlock') ? 'bg-[rgba(255,107,0,0.12)] text-[#FF6B00]' : 'text-[#888888] hover:bg-[#1C1C1C]'}`}>Code</button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={`h-[28px] px-[7px] rounded text-[12.5px] cursor-pointer text-[#888888] hover:bg-[#1C1C1C] transition-colors`}>—</button>
          </div>
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
        style={{ backgroundColor: currentColor.hex, backgroundImage: bgImage, backgroundSize: note.paperStyle === 'dotted' ? '14px 14px' : 'auto' }}
        onClick={() => editor?.commands.focus()}
      >
        <div 
          className="mx-auto w-full p-[24px_32px]"
          style={{ maxWidth: note.noteWidth === 'wide' ? '100%' : '720px' }}
        >
          <style>{`
            .tiptap {
              font-family: ${fontFamilyMap[note.fontFamily || 'sans']};
              color: ${textColor};
              font-size: 15.5px;
              line-height: 1.8;
              outline: none;
              min-height: calc(100vh - 200px);
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
  );
}
