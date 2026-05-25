import { Router } from 'express';
import { protect } from '../middleware/auth';
import { chat, formatVoice } from '../controllers/aiController';

const router = Router();

router.post('/', protect, chat);
router.post('/format-voice', protect, formatVoice);

export default router;
