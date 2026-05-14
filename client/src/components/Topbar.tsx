import React from 'react';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types';

interface TopbarProps {
  selectedNote: Note | null;
  isAIOpen: boolean;
  onToggleAI: () => void;
}

export default function Topbar({ selectedNote, isAIOpen, onToggleAI }: TopbarProps) {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-[46px] bg-[#0A0A0A] border-b border-[#2A2A2A] flex flex-row items-center justify-between px-4 shrink-0">
      <div className="flex-1 overflow-hidden pr-4">
        {selectedNote && (
          <div className="text-[14px] font-medium text-[#F0F0F0] truncate max-w-[300px]">
            {selectedNote.title || 'Untitled'}
          </div>
        )}
      </div>

      <div className="flex flex-row items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-150 border ${
            isAIOpen 
              ? 'bg-[rgba(255,107,0,0.12)] border-[#FF6B00] text-[#FF6B00]' 
              : 'bg-transparent border-[#2A2A2A] text-[#888888] hover:bg-[#111111]'
          }`}
        >
          <Sparkles className="w-[14px] h-[14px]" />
          Kairo AI
        </button>

        <div className="w-[1px] h-[20px] bg-[#2A2A2A] mx-1" />

        <div className="w-[28px] h-[28px] rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-[11px] font-semibold text-[#FF6B00]">
          {getInitials(user?.name)}
        </div>
        <span className="text-[13px] text-[#888888] mr-1">
          {user?.name}
        </span>

        <button
          onClick={logout}
          title="Sign out"
          className="w-[28px] h-[28px] rounded-md flex items-center justify-center text-[#444444] hover:text-[#FF3B30] hover:bg-[#1C1C1C] transition-colors cursor-pointer ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
