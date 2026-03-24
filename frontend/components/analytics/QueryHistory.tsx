'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function QueryHistory() {
  const { queries } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = queries
    .filter((q) => {
      const matchesSearch = !search || q.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || q.result_type === filterType;
      return matchesSearch && matchesType;
    })
    .reverse();

  const types = ['all', 'arithmetic', 'graphing', 'equation', 'unit_conversion', 'matrix', 'general'];

  return (
    <div>
      <h3 className="font-semibold mb-4">Query History</h3>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search queries..."
          className="flex-1 bg-background rounded-lg px-3 py-2 text-sm outline-none border border-white/5 focus:border-primary/50"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-background rounded-lg px-3 py-2 text-sm outline-none border border-white/5"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === 'all' ? 'All Types' : t.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No queries found.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="p-3 bg-background rounded-xl border border-white/5 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm truncate">{q.prompt}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {new Date(q.timestamp).toLocaleString()}
                  </span>
                  {q.tool_used && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded">
                      {q.tool_used}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  q.result_type === 'graphing' ? 'bg-yellow-500/10 text-yellow-400' :
                  q.result_type === 'equation' ? 'bg-green-500/10 text-green-400' :
                  q.result_type === 'arithmetic' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {q.result_type}
                </span>
                <span className="text-[10px] text-gray-600">{q.response_time}ms</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
