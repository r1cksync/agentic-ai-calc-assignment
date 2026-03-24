import type { VercelRequest, VercelResponse } from '@vercel/node';
import { curveLibrary, lookupCurve } from '../src/lib/curveLibrary';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = req.query.q as string | undefined;

  if (q) {
    const result = lookupCurve(q);
    if (result) return res.json(result);
    return res.status(404).json({ error: `Curve "${q}" not found` });
  }

  return res.json(curveLibrary);
}
