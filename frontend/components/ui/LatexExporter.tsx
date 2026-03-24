'use client';

import { useState } from 'react';

interface Props {
  steps: string[];
}

export default function LatexExporter({ steps }: Props) {
  const [copied, setCopied] = useState(false);

  const toLatex = () => {
    return steps
      .map((s) =>
        s
          .replace(/\*/g, '\\cdot ')
          .replace(/\^(\w+)/g, '^{$1}')
          .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
          .replace(/pi/g, '\\pi')
          .replace(/>=/, '\\geq ')
          .replace(/<=/, '\\leq ')
      )
      .join(' \\\\\n');
  };

  const copy = async () => {
    const latex = `\\begin{align*}\n${toLatex()}\n\\end{align*}`;
    await navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="text-[10px] px-3 py-1 rounded bg-surface-light border border-white/10 text-gray-400 hover:text-white transition-colors"
    >
      {copied ? '✓ Copied!' : '📋 Copy as LaTeX'}
    </button>
  );
}
