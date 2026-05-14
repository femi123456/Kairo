import React, { useEffect, useState, useCallback } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import KairoAI from '../components/KairoAI';

const AppLayout = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const selectedNote = notes.find(n => n._id === selectedNoteId) || null;

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
      setNotes((prev) => {
        if (prev.find(n => n._id === note._id)) return prev;
        return [note, ...prev];
      });
    };

    const handleNoteUpdated = ({ note }: { note: Note }) => {
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? note : n))
      );
    };

    const handleNoteDeleted = ({ noteId }: { noteId: string }) => {
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
      socket.emit('note-created', newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-['Inter']">
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onNewNote={handleNewNote}
        isLoading={isLoading}
      />
      <Editor
        note={selectedNote}
        onNoteUpdate={handleNoteUpdate}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
      />
      <KairoAI
        note={selectedNote}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onNoteUpdate={handleNoteUpdate}
      />
    </div>
  );
};

export default AppLayout;
