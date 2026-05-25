import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import KairoAI from '../components/KairoAI';
import Topbar from '../components/Topbar';

const AppLayout = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [incomingSocketUpdate, setIncomingSocketUpdate] = useState<Note | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [selectedText, setSelectedText] = useState('');
  const selectedNoteIdRef = useRef<string | null>(null);
  const isTypingRef = useRef(false);

  const selectedNote = notes.find(n => n._id === selectedNoteId) || null;

  // Keep ref in sync so socket handlers can read the current value
  selectedNoteIdRef.current = selectedNoteId;

  const handleNoteUpdate = useCallback((updatedNote: Note | null) => {
    if (!updatedNote) {
      // Note was deleted
      setSelectedNoteId(null);
      return;
    }
    setNotes(prev => prev.map(n => n._id === updatedNote._id ? updatedNote : n));
  }, []);

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join-room', { userId: user.id });

    const fetchNotes = async () => {
      try {
        const response = await api.get('/notes');
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();

    const handleNoteCreated = ({ note }: { note: Note }) => {
      if (!note || !note._id) return;
      setNotes((prev) => {
        if (prev.find(n => n._id === note._id)) return prev;
        return [note, ...prev];
      });
    };

    const handleNoteUpdated = ({ note }: { note: Note }) => {
      if (!note || !note._id) return;
      if (note._id === selectedNoteIdRef.current && isTypingRef.current) return;
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? note : n))
      );
      if (note._id === selectedNoteIdRef.current) {
        setIncomingSocketUpdate(note);
      }
    };

    const handleNoteDeleted = ({ noteId }: { noteId: string }) => {
      if (!noteId) return;
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      setSelectedNoteId(prev => prev === noteId ? null : prev);
    };

    socket.on('note-created', handleNoteCreated);
    socket.on('note-updated', handleNoteUpdated);
    socket.on('note-deleted', handleNoteDeleted);

    return () => {
      socket.off('note-created', handleNoteCreated);
      socket.off('note-updated', handleNoteUpdated);
      socket.off('note-deleted', handleNoteDeleted);
      socket.disconnect();
    };
  }, [user]);

  const handleNewNote = async () => {
    try {
      const response = await api.post('/notes', {
        title: 'Untitled Note',
        body: '',
        tags: []
      });
      const newNote = response.data.note;
      setNotes((prev) => {
        if (prev.find(n => n._id === newNote._id)) return prev;
        return [newNote, ...prev];
      });
      setSelectedNoteId(newNote._id);
      socket.emit('note-created', { userId: user!.id, note: newNote });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewNote();
      }
      // Cmd/Ctrl + F
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Escape
      if (e.key === 'Escape') {
        setIsAiOpen(false);
        window.dispatchEvent(new Event('close-popovers'));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-['Inter']">
      <div className={`h-full shrink-0 ${mobileView === 'list' ? 'block w-full' : 'hidden'} md:block md:w-[268px]`}>
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(id) => {
            setSelectedNoteId(id);
            setMobileView('editor');
          }}
          onNewNote={handleNewNote}
          isLoading={isLoading}
        />
      </div>
      <div className={`flex-1 flex-col min-w-0 bg-[#0A0A0A] ${mobileView === 'editor' ? 'flex' : 'hidden'} md:flex`}>
        <Topbar 
          selectedNote={selectedNote}
          isAIOpen={isAiOpen}
          onToggleAI={() => setIsAiOpen(!isAiOpen)}
          onBack={() => setMobileView('list')}
        />
        <div className="flex-1 flex flex-row overflow-hidden">
          <Editor
            note={selectedNote}
            onNoteUpdate={handleNoteUpdate}
            incomingSocketUpdate={incomingSocketUpdate}
            clearIncomingUpdate={() => setIncomingSocketUpdate(null)}
            isTypingRef={isTypingRef}
            onEditorReady={setEditorInstance}
            onSelectedTextChange={setSelectedText}
          />
          <KairoAI
            note={selectedNote}
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
            onNoteUpdate={handleNoteUpdate}
            editor={editorInstance}
            selectedText={selectedText}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
