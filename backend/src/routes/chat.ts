import { Router, Request, Response } from 'express';
import { runAgentLoop } from '../lib/groqAgent';
import { ChatRequest } from '../types/index';

const router = Router();

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, session_id } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
      res.status(500).json({ error: 'GROQ_API_KEY is not configured. Please set it in the .env file.' });
      return;
    }

    const startTime = Date.now();
    const result = await runAgentLoop(messages);
    const responseTime = Date.now() - startTime;

    res.json({ ...result, session_id, response_time: responseTime });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Chat error:', msg);
    res.status(500).json({ error: msg });
  }
});

export default router;
