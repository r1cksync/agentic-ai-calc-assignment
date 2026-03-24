'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { sendChatMessage } from '@/lib/api';
import { v4 } from '@/store/uuid';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const colors = ['#06B6D4', '#7C3AED', '#F59E0B', '#EF4444'];

export default function ComparisonMode() {
  const [expressions, setExpressions] = useState<string[]>(['sin(x)', 'cos(x)']);
  const [xRange, setXRange] = useState<[number, number]>([-10, 10]);
  const [loading, setLoading] = useState(false);
  const { comparison, setComparison, setActivePanel, sessionId, addMessage, addQuery } = useStore();

  const addExpression = () => {
    if (expressions.length < 4) {
      setExpressions([...expressions, '']);
    }
  };

  const removeExpression = (index: number) => {
    setExpressions(expressions.filter((_, i) => i !== index));
  };

  const updateExpression = (index: number, value: string) => {
    const newExprs = [...expressions];
    newExprs[index] = value;
    setExpressions(newExprs);
  };

  const compare = async () => {
    const validExprs = expressions.filter((e) => e.trim());
    if (validExprs.length < 2) return;

    setLoading(true);
    try {
      const prompt = `Compare these functions: ${validExprs.join(', ')} on the range [${xRange[0]}, ${xRange[1]}]`;
      const userMsg = { id: v4(), role: 'user' as const, content: prompt, timestamp: Date.now() };
      addMessage(userMsg);

      const response = await sendChatMessage(
        [{ role: 'user', content: prompt }],
        sessionId
      );

      const assistantMsg = {
        id: v4(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: Date.now(),
        tool_calls: response.tool_calls,
        graph_data: response.graph_data,
      };
      addMessage(assistantMsg);

      if (response.graph_data) {
        // Extract intersections from tool_calls results
        let intersections: { x: number; y: number }[] = [];
        for (const tc of response.tool_calls) {
          if (tc.name === 'compare_functions' && tc.result) {
            const res = tc.result as { intersections?: { x: number; y: number }[] };
            if (res.intersections) intersections = res.intersections;
          }
        }

        setComparison({
          expressions: validExprs,
          graph_data: response.graph_data,
          intersections,
        });
      }

      addQuery({
        id: v4(),
        prompt,
        timestamp: Date.now(),
        tool_used: 'compare_functions',
        result_type: 'graphing',
        response_time: response.response_time,
      });
    } catch (err) {
      addMessage({
        id: v4(),
        role: 'assistant',
        content: `Comparison error: ${err instanceof Error ? err.message : 'Unknown'}`,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-surface/50 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Comparison Mode</h3>
        <button
          onClick={() => setActivePanel('graph')}
          className="text-xs text-gray-400 hover:text-white"
        >
          ← Back to Graph
        </button>
      </div>

      {/* Expression Inputs */}
      <div className="p-4 border-b border-white/5 space-y-3">
        {expressions.map((expr, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[i] }}
            />
            <input
              type="text"
              value={expr}
              onChange={(e) => updateExpression(i, e.target.value)}
              placeholder={`f${i + 1}(x) = ...`}
              className="flex-1 bg-surface-light rounded-lg px-3 py-2 text-sm outline-none border border-white/5 focus:border-primary/50 font-mono"
            />
            {expressions.length > 2 && (
              <button onClick={() => removeExpression(i)} className="text-gray-500 hover:text-red-400 text-sm">
                ✕
              </button>
            )}
          </motion.div>
        ))}

        <div className="flex items-center gap-3">
          {expressions.length < 4 && (
            <button onClick={addExpression} className="text-xs text-primary hover:text-primary/80">
              + Add function
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">X range:</span>
            <input
              type="number"
              value={xRange[0]}
              onChange={(e) => setXRange([parseFloat(e.target.value), xRange[1]])}
              className="w-16 bg-surface-light rounded px-2 py-1 text-xs outline-none border border-white/5"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={xRange[1]}
              onChange={(e) => setXRange([xRange[0], parseFloat(e.target.value)])}
              className="w-16 bg-surface-light rounded px-2 py-1 text-xs outline-none border border-white/5"
            />
          </div>

          <button
            onClick={compare}
            disabled={loading || expressions.filter((e) => e.trim()).length < 2}
            className="px-4 py-2 bg-primary rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-primary/80 transition-colors"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 p-4">
        {comparison ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
          >
            <Plot
              data={comparison.graph_data.data as Plotly.Data[]}
              layout={{
                ...comparison.graph_data.layout,
                autosize: true,
                margin: { t: 50, r: 30, b: 50, l: 60 },
              } as Partial<Plotly.Layout>}
              config={{ responsive: true }}
              style={{ width: '100%', height: '80%' }}
            />

            {/* Intersections */}
            {comparison.intersections.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Intersection Points</h4>
                <div className="flex flex-wrap gap-2">
                  {comparison.intersections.map((pt, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20">
                      ({pt.x.toFixed(3)}, {pt.y.toFixed(3)})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Legend with toggles */}
            <div className="mt-3 flex items-center gap-4">
              {comparison.expressions.map((expr, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                  <span className="text-gray-300 font-mono">{expr}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Enter expressions above and click Compare</p>
          </div>
        )}
      </div>
    </div>
  );
}
