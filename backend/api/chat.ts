import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runAgentLoop } from '../src/lib/groqAgent';
import { ChatRequest } from '../src/types';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, session_id } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured.' });
    }

    const startTime = Date.now();
    const result = await runAgentLoop(messages);
    const responseTime = Date.now() - startTime;

    return res.json({ ...result, session_id, response_time: responseTime });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    const stack = error instanceof Error ? error.stack : '';
    const name = error instanceof Error ? error.name : '';
    console.error('Chat error:', name, msg, stack);
    return res.status(500).json({ error: msg, error_type: name, details: stack?.slice(0, 500) });
  }
}
