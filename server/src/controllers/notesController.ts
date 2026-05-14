import { Request, Response } from 'express';
import crypto from 'crypto';
import Note from '../models/Note';
import { AuthRequest } from '../types';
import { getIo } from '../lib/socketInstance';

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json({ notes });
  } catch (error) {
    console.error('getNotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const note = new Note({ userId });
    await note.save();

    const io = getIo();
    if (io && userId) {
      io.to(userId.toString()).emit('note-created', { note });
    }

    res.status(201).json({ note });
  } catch (error) {
    console.error('createNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    const { title, body, tags, pageColor, paperStyle, fontFamily, noteWidth } = req.body;

    // If body changed, push current body to versions array keeping only the last 10
    if (body !== undefined && body !== note.body) {
      note.versions.push({ body: note.body, savedAt: new Date() });
      if (note.versions.length > 10) {
        note.versions = note.versions.slice(-10);
      }
    }

    if (title !== undefined) note.title = title;
    if (body !== undefined) note.body = body;
    if (tags !== undefined) note.tags = tags;
    if (pageColor !== undefined) note.pageColor = pageColor;
    if (paperStyle !== undefined) note.paperStyle = paperStyle;
    if (fontFamily !== undefined) note.fontFamily = fontFamily;
    if (noteWidth !== undefined) note.noteWidth = noteWidth;

    await note.save();

    const io = getIo();
    if (io && userId) {
      io.to(userId.toString()).emit('note-updated', { note });
    }

    res.status(200).json({ note });
  } catch (error) {
    console.error('updateNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    const note = await Note.findOneAndDelete({ _id: noteId, userId });
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    const io = getIo();
    if (io && userId) {
      io.to(userId.toString()).emit('note-deleted', { noteId });
    }

    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    console.error('deleteNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    if (!note.isPublic) {
      note.isPublic = true;
      note.shareId = crypto.randomBytes(8).toString('hex');
      await note.save();
      
      const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
      const shareUrl = `${CLIENT_URL}/note/${note.shareId}`;
      
      res.status(200).json({ note, shareUrl });
    } else {
      note.isPublic = false;
      note.shareId = null;
      await note.save();
      
      res.status(200).json({ note });
    }
  } catch (error) {
    console.error('toggleShare error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPublicNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;

    const note = await Note.findOne({ shareId, isPublic: true }).select(
      'title body pageColor paperStyle fontFamily tags'
    );

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    res.status(200).json({ note });
  } catch (error) {
    console.error('getPublicNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
