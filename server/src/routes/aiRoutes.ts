import { Router } from 'express';
import { protect } from '../middleware/auth';
import { chat } from '../controllers/aiController';

const router = Router();

router.post('/', protect, chat);

export default router;
