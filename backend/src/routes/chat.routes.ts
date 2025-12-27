import { Router } from 'express';
import { askQuestion } from '../controllers/chat.controller';

const router = Router();

// POST /api/chat/ask - Ask a question to the multi-agent system
router.post('/ask', askQuestion);

export default router;
