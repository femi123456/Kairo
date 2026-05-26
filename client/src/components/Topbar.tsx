import { Sparkles, LogOut, ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types';

interface TopbarProps {
  selectedNote: Note | null;
  isAIOpen: boolean;
  onToggleAI: () => void;
  onBack?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Topbar({ selectedNote, isAIOpen, onToggleAI, onBack, isSidebarOpen, onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-[46px] bg-[#0A0A0A] border-b border-[#2A2A2A] flex flex-row items-center justify-between px-2 md:px-4 shrink-0">
      <div className="flex-1 overflow-hidden pr-2 md:pr-4 flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex w-[32px] h-[32px] rounded-md items-center justify-center text-[#888888] hover:bg-[#1C1C1C] transition-colors cursor-pointer shrink-0"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        )}
        {onBack && (
          <button 
            onClick={onBack}
            className="md:hidden w-[32px] h-[32px] rounded-md flex items-center justify-center text-[#888888] hover:bg-[#1C1C1C] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {selectedNote && (
          <div className="text-[14px] font-medium text-[#F0F0F0] truncate max-w-[300px] hidden md:block">
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
          <span className="hidden md:inline">Kairo AI</span>
        </button>

        <div className="w-[1px] h-[20px] bg-[#2A2A2A] mx-1" />

        <div className="w-[28px] h-[28px] rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-[11px] font-semibold text-[#FF6B00]">
          {getInitials(user?.name)}
        </div>
        <span className="text-[13px] text-[#888888] mr-1 hidden md:block">
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
