'use client';

import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];

export default function ComputationStats() {
  const { queries } = useStore();

  const toolUsageData = useMemo(() => {
    const counts: Record<string, number> = {};
    queries.forEach((q) => {
      const tool = q.tool_used || 'none';
      counts[tool] = (counts[tool] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [queries]);

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    queries.forEach((q) => {
      counts[q.result_type] = (counts[q.result_type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [queries]);

  const responseTimeData = useMemo(() => {
    return queries.map((q, i) => ({
      index: i + 1,
      time: q.response_time,
    }));
  }, [queries]);

  const topExpressions = useMemo(() => {
    const counts: Record<string, number> = {};
    queries.forEach((q) => {
      counts[q.prompt] = (counts[q.prompt] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([expr, count]) => ({ expr, count }));
  }, [queries]);

  if (queries.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-4">Computation Statistics</h3>
        <p className="text-gray-500 text-sm">No data yet. Start making queries!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4">Tool Usage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={toolUsageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#1A1A2E', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Query Type Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {typeDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1A1A2E', border: '1px solid #333', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Response Time (ms)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="index" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1A1A2E', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="time" stroke="#06B6D4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topExpressions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Top Expressions</h4>
          <div className="space-y-2">
            {topExpressions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg">
                <span className="text-xs font-mono text-gray-300 truncate flex-1">{item.expr}</span>
                <span className="text-xs text-gray-500 ml-3">{item.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
