import { Router, Request, Response } from 'express';
import { curveLibrary, lookupCurve } from '../lib/curveLibrary';

const router = Router();

router.get('/curves', (_req: Request, res: Response) => {
  res.json(curveLibrary);
});

router.get('/curves/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const result = lookupCurve(query);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: `Curve "${query}" not found` });
  }
});

export default router;
