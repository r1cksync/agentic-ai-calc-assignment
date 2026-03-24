'use client';

import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import AnimatedCounter from '../ui/AnimatedCounter';
import SessionHeatmap from './SessionHeatmap';
import QueryHistory from './QueryHistory';
import ComputationStats from './ComputationStats';

export default function AnalyticsDashboard() {
  const { messages, graphs, queries } = useStore();

  const totalQueries = queries.length;
  const toolCalls = queries.filter((q) => q.tool_used).length;
  const graphsGenerated = graphs.length;
  const equationsSolved = queries.filter((q) => q.result_type === 'equation').length;

  const stats = [
    { label: 'Total Queries', value: totalQueries, color: '#7C3AED' },
    { label: 'Tool Calls', value: toolCalls, color: '#06B6D4' },
    { label: 'Graphs Generated', value: graphsGenerated, color: '#F59E0B' },
    { label: 'Equations Solved', value: equationsSolved, color: '#10B981' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold"
      >
        Analytics Dashboard
      </motion.h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-surface rounded-2xl border border-white/5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <AnimatedCounter value={stat.value} color={stat.color} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <ComputationStats />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <SessionHeatmap />
        </motion.div>
      </div>

      {/* Query History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface rounded-2xl border border-white/5 p-6"
      >
        <QueryHistory />
      </motion.div>

      {/* Graph Gallery */}
      {graphs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface rounded-2xl border border-white/5 p-6"
        >
          <h3 className="font-semibold mb-4">Graph Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {graphs.map((graph) => (
              <div
                key={graph.id}
                className="p-3 bg-background rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="text-3xl text-center mb-2">📊</div>
                <p className="text-[10px] text-gray-400 truncate font-mono">{graph.expression}</p>
                <p className="text-[10px] text-gray-600 mt-1">{graph.graph_data.type}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
