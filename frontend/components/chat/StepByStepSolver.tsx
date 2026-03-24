'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  steps: string[];
}

export default function StepByStepSolver({ steps }: Props) {
  const [expanded, setExpanded] = useState(true);

  const copyAsLatex = () => {
    const latex = steps
      .map((s) => {
        // Basic conversion of common patterns to LaTeX
        return s
          .replace(/\^(\d+)/g, '^{$1}')
          .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
          .replace(/pi/g, '\\pi');
      })
      .join(' \\\\\n');
    navigator.clipboard.writeText(`\\begin{align}\n${latex}\n\\end{align}`);
  };

  return (
    <div className="ml-12 mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-secondary hover:text-secondary/80 mb-2 flex items-center gap-1"
      >
        <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        Step-by-step solution ({steps.length} steps)
      </button>

      {expanded && (
        <div className="space-y-2">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`px-4 py-2 rounded-lg text-sm border ${
                i === steps.length - 1
                  ? 'bg-primary/10 border-primary/30 text-white font-medium'
                  : 'bg-surface border-white/5 text-gray-300'
              }`}
            >
              <span className="text-[10px] text-gray-500 mr-2">Step {i + 1}</span>
              <span className="font-mono text-xs">{step}</span>
            </motion.div>
          ))}

          <button
            onClick={copyAsLatex}
            className="text-[10px] px-3 py-1 rounded bg-surface-light border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            📋 Copy as LaTeX
          </button>
        </div>
      )}
    </div>
  );
}
