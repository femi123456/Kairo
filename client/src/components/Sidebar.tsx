import React, { useState, useMemo } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '../types';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('All');

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => tags.add(tag));
      }
    });
    return ['All', ...Array.from(tags)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.body.replace(/<[^>]*>?/gm, '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = activeTag === 'All' || (note.tags && note.tags.includes(activeTag));
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, activeTag]);

  return (
    <div className="flex flex-col h-full w-full bg-[#111111] border-r-0 md:border-r border-[#2A2A2A] shrink-0">
      {/* Top Section */}
      <div className="p-[16px_14px_10px]">
        {/* Logo */}
        <div className="font-['Georgia'] text-[18px] font-bold mb-4 leading-none">
          <span className="text-white">Kai</span>
          <span className="text-[#FF6B00]">ro</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#444444]" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-[8px_12px_8px_36px] text-[13px] text-[#F0F0F0] placeholder:text-[#444444] focus:border-[#FF6B00] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex overflow-x-auto p-[8px_14px] gap-2 items-center scrollbar-hide shrink-0" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`whitespace-nowrap text-[11px] px-[10px] py-[3px] rounded-full border transition-[background-color,border-color,color] duration-150 cursor-pointer ${
              activeTag === tag
                ? 'bg-[rgba(255,107,0,0.12)] border-[#FF6B00] text-[#FF6B00] font-medium'
                : 'bg-transparent border-[#2A2A2A] text-[#888888] hover:border-[#444444]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* New Note Button */}
      <button
        onClick={onNewNote}
        className="mx-[10px] mb-[8px] mt-[4px] p-[9px] bg-[#FF6B00] text-white rounded-lg flex items-center justify-center gap-2 text-[13px] font-medium hover:bg-[#FF8C2A] transition-colors duration-150 cursor-pointer shrink-0"
      >
        <Plus className="w-[16px] h-[16px]" />
        New note
      </button>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="p-2 flex flex-col gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-[#1C1C1C] animate-pulse rounded-lg h-[72px] mx-[6px] mb-[2px]"
              />
            ))}
          </div>
        ) : notes.length === 0 && !searchTerm ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <FileText className="w-[32px] h-[32px] text-[#333333] mb-3" />
            <h3 className="text-[#444444] font-medium mb-1">No notes yet</h3>
            <p className="text-[#333333] text-[13px]">Create your first note</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-6 text-center text-[#444444] text-[13px]">
            No notes match your search
          </div>
        ) : (
          <div className="p-2 flex flex-col gap-1">
            {filteredNotes.map((note) => {
              const isSelected = selectedNoteId === note._id;
              const strippedBody = note.body ? note.body.replace(/<[^>]*>?/gm, '') : '';

              return (
                <div
                  key={note._id}
                  onClick={() => onSelectNote(note._id)}
                  className={`relative p-[10px_12px] rounded-lg cursor-pointer mx-[6px] min-h-[68px] md:min-h-auto border ${
                    isSelected
                      ? 'bg-[rgba(255,107,0,0.08)] border-transparent'
                      : 'border-transparent hover:bg-[#1C1C1C]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-[10px] bottom-[10px] w-[3px] bg-[#FF6B00] rounded-r" />
                  )}
                  
                  <div className={`transition-all ${isSelected ? 'pl-[9px]' : ''}`}>
                    <h4 className="text-[13px] font-medium text-[#F0F0F0] whitespace-nowrap overflow-hidden text-ellipsis mb-1">
                      {note.title || 'Untitled Note'}
                    </h4>
                    
                    <p className="text-[11.5px] text-[#888888] line-clamp-2 overflow-hidden mb-2 leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {strippedBody || 'No content'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 overflow-hidden">
                        {note.tags && note.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-[6px] py-[1px] rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-[#444444] whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <span className="text-[10px] text-[#444444] whitespace-nowrap ml-2">
                        {note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
