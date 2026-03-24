import { Message, PlotlyGraphData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  sessionId: string
): Promise<{
  message: string;
  tool_calls: { name: string; input: Record<string, unknown>; result: unknown }[];
  graph_data?: PlotlyGraphData;
  steps?: string[];
  follow_up_prompts?: string[];
  response_time: number;
}> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, session_id: sessionId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function exportPdf(
  notebookContent: string,
  graphs: string[]
): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notebook_content: notebookContent, graphs }),
  });

  if (!res.ok) {
    throw new Error('PDF export failed');
  }

  return res.blob();
}

export async function fetchCurves(): Promise<
  { name: string; formula: string; description: string; type: string; paramRange?: [number, number] }[]
> {
  const res = await fetch(`${API_BASE}/api/curves`);
  if (!res.ok) throw new Error('Failed to fetch curves');
  return res.json();
}
