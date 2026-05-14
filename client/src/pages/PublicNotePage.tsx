import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import type { Note } from '../types';

export default function PublicNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/public/${shareId}`);
        setNote(response.data.note);
      } catch (err) {
        console.error('Failed to fetch public note:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchNote();
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center font-['Inter']">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <span className="text-[24px] font-bold tracking-tight text-white">Kai</span>
          <span className="text-[24px] font-bold tracking-tight text-[#FF6B00]">ro</span>
        </div>
        <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center font-['Inter'] text-center px-4">
        <h1 className="text-[20px] font-semibold text-[#F0F0F0] mb-2">This note is not available</h1>
        <p className="text-[#888888] text-[14px] mb-6">The link might be broken, or the note has been unshared.</p>
        <Link 
          to="/auth" 
          className="bg-[#1C1C1C] hover:bg-[#2A2A2A] text-[#F0F0F0] px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors border border-[#2A2A2A]"
        >
          Go to Kairo
        </Link>
      </div>
    );
  }

  // Determine text color based on page background
  // If it's the light theme (#E6E1D8), use dark text. Otherwise, use light text.
  const isLightBackground = note.pageColor === '#E6E1D8';
  const titleColor = isLightBackground ? '#111111' : '#F0F0F0';

  const paperStyleClasses = {
    dots: 'bg-[radial-gradient(#444444_1px,transparent_1px)] [background-size:20px_20px]',
    lines: 'bg-[linear-gradient(transparent_23px,#444444_24px)] [background-size:100%_24px]',
    grid: 'bg-[linear-gradient(#444444_1px,transparent_1px),linear-gradient(90deg,#444444_1px,transparent_1px)] [background-size:20px_20px]',
    none: ''
  };

  const getFontClass = (font?: string) => {
    switch (font) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  return (
    <div 
      className={`min-h-screen w-full selection:bg-[#FF6B00] selection:text-white ${paperStyleClasses[note.paperStyle || 'none']}`}
      style={{ backgroundColor: note.pageColor || '#1A1A1A' }}
    >
      <div className="max-w-[720px] mx-auto px-8 py-12 flex flex-col min-h-screen">
        
        {/* Header / Logo */}
        <div className="mb-12">
          <Link to="/auth" className="inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity">
            <span className="text-[14px] font-bold tracking-tight text-white">Kai</span>
            <span className="text-[14px] font-bold tracking-tight text-[#FF6B00]">ro</span>
          </Link>
        </div>

        {/* Note Content */}
        <div className={`flex-1 ${getFontClass(note.fontFamily)}`}>
          <h1 
            className="text-[28px] font-bold mb-2 leading-tight"
            style={{ color: titleColor }}
          >
            {note.title || 'Untitled Note'}
          </h1>
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div 
            className={`tiptap ProseMirror !p-0 !bg-transparent !border-none ${
              isLightBackground ? 'text-[#222222]' : 'text-[#D4D4D4]'
            }`}
            style={{ minHeight: 'auto' }}
            dangerouslySetInnerHTML={{ __html: note.body || '' }}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-[12px] text-[#444444] font-['Inter']">
            Made with Kairo
          </p>
        </div>

      </div>
    </div>
  );
}
