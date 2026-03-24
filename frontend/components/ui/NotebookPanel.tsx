'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { exportPdf } from '@/lib/api';

export default function NotebookPanel() {
  const { notebookContent, setNotebookContent, messages, graphs } = useStore();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const importFromChat = () => {
    const lastResults = messages
      .filter((m) => m.role === 'assistant')
      .slice(-5)
      .map((m) => {
        let text = `## ${new Date(m.timestamp).toLocaleString()}\n\n${m.content}`;
        if (m.steps) {
          text += '\n\n### Steps:\n' + m.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
        }
        return text;
      })
      .join('\n\n---\n\n');

    setNotebookContent(notebookContent + '\n\n---\n\n' + lastResults);
  };

  const handleExportPdf = async () => {
    try {
      const graphImages = graphs.map((g) => g.thumbnail || '').filter(Boolean);
      const blob = await exportPdf(notebookContent, graphImages);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'math-notebook.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('PDF export failed. Make sure the backend server is running.');
    }
  };

  const renderedMarkdown = useMemo(() => {
    return notebookContent
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold mb-3 mt-6">${line.slice(2)}</h1>`;
        if (line.startsWith('## ')) return `<h2 class="text-xl font-semibold mb-2 mt-4">${line.slice(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3 class="text-lg font-medium mb-2 mt-3">${line.slice(4)}</h3>`;
        if (line.startsWith('- ')) return `<li class="ml-4 list-disc text-gray-300">${line.slice(2)}</li>`;
        if (line.startsWith('---')) return '<hr class="border-white/10 my-4" />';
        if (line.trim() === '') return '<br />';
        // Inline code
        const withCode = line.replace(/`([^`]+)`/g, '<code class="bg-surface-light px-1 rounded text-secondary font-mono text-sm">$1</code>');
        // Bold
        const withBold = withCode.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        return `<p class="text-gray-300 leading-relaxed">${withBold}</p>`;
      })
      .join('\n');
  }, [notebookContent]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-surface/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">Notebook</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`text-xs px-3 py-1 rounded ${activeTab === 'edit' ? 'bg-primary text-white' : 'bg-surface-light text-gray-400'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`text-xs px-3 py-1 rounded ${activeTab === 'preview' ? 'bg-primary text-white' : 'bg-surface-light text-gray-400'}`}
            >
              Preview
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={importFromChat}
            className="text-xs px-3 py-1.5 bg-surface-light rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            📥 Import from Chat
          </button>
          <button
            onClick={handleExportPdf}
            className="text-xs px-3 py-1.5 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'edit' ? (
          <div className="h-full p-6">
            <textarea
              value={notebookContent}
              onChange={(e) => setNotebookContent(e.target.value)}
              className="notebook-editor w-full h-full bg-background rounded-xl p-6 border border-white/5 outline-none text-gray-300 focus:border-primary/30 transition-colors"
              placeholder="# My Math Notes&#10;&#10;Start writing here..."
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-y-auto p-6"
          >
            <div
              className="max-w-3xl mx-auto bg-surface rounded-xl p-8 border border-white/5"
              dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
