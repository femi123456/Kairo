import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleShare,
  getPublicNote,
} from '../controllers/notesController';

const router = Router();

router.get('/', protect, getNotes);
router.post('/', protect, createNote);
router.patch('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);
router.post('/:id/share', protect, toggleShare);

router.get('/public/:shareId', getPublicNote);

export default router;
