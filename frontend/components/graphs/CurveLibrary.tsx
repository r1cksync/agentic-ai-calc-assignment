'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchCurves } from '@/lib/api';
import { CurveDefinition } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { sendChatMessage } from '@/lib/api';
import { v4 } from '@/store/uuid';

export default function CurveLibrary() {
  const [curves, setCurves] = useState<CurveDefinition[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { addMessage, addGraph, addQuery, sessionId, setLoading } = useStore();

  useEffect(() => {
    fetchCurves()
      .then(setCurves)
      .catch(() => {
        // Fallback with some defaults
        setCurves([
          { name: 'Parabola', formula: 'x^2', description: 'A U-shaped quadratic curve.', type: '2d' },
          { name: 'Sine', formula: 'sin(x)', description: 'Fundamental periodic wave.', type: '2d' },
          { name: 'Cardioid', formula: '1 + cos(theta)', description: 'Heart-shaped polar curve.', type: 'polar' },
          { name: 'Saddle', formula: 'x^2 - y^2', description: 'Hyperbolic paraboloid.', type: '3d' },
        ]);
      });
  }, []);

  const filtered = curves.filter((c) => {
    const matchesType = filter === 'all' || c.type === filter;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const plotCurve = async (curve: CurveDefinition) => {
    setLoading(true);
    try {
      const prompt = `Plot the ${curve.name}: ${curve.formula}`;
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
        steps: response.steps,
        follow_up_prompts: response.follow_up_prompts,
      };
      addMessage(assistantMsg);

      if (response.graph_data) {
        addGraph({
          id: v4(),
          message_id: assistantMsg.id,
          graph_data: response.graph_data,
          expression: curve.formula,
          timestamp: Date.now(),
        });
      }

      addQuery({
        id: v4(),
        prompt,
        timestamp: Date.now(),
        tool_used: 'plot_function',
        result_type: 'graphing',
        response_time: response.response_time,
      });
    } catch (err) {
      addMessage({
        id: v4(),
        role: 'assistant',
        content: `Error plotting ${curve.name}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const types = ['all', '2d', '3d', 'polar', 'parametric'];

  return (
    <div className="p-4">
      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search curves..."
          className="flex-1 bg-surface-light rounded-lg px-3 py-2 text-sm outline-none border border-white/5 focus:border-primary/50"
        />
        <div className="flex gap-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-[10px] px-2 py-1 rounded ${
                filter === t ? 'bg-primary text-white' : 'bg-surface-light text-gray-400'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Curves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((curve, i) => (
          <motion.div
            key={curve.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-surface rounded-xl border border-white/5 hover:border-primary/30 transition-all group cursor-pointer"
            onClick={() => plotCurve(curve)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{curve.name}</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                {curve.type}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2">{curve.description}</p>
            <code className="text-[10px] text-secondary font-mono bg-background px-2 py-1 rounded block">
              {curve.formula}
            </code>
            <div className="mt-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Click to plot →
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
