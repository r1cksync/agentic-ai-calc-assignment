'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CurveLibrary from './CurveLibrary';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function GraphPanel() {
  const { graphs, activeGraphId, setActiveGraphId, setActivePanel } = useStore();
  const [showGrid, setShowGrid] = useState(true);
  const [showCurveLib, setShowCurveLib] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const activeGraph = graphs.find((g) => g.id === activeGraphId) || graphs[graphs.length - 1];

  if (!activeGraph && !showCurveLib) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg mb-4">No graphs yet</p>
        <button
          onClick={() => setShowCurveLib(true)}
          className="px-4 py-2 bg-primary rounded-lg text-sm"
        >
          Browse Curve Library
        </button>
      </div>
    );
  }

  if (showCurveLib) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold">Curve Library</h3>
          <button onClick={() => setShowCurveLib(false)} className="text-gray-400 hover:text-white text-sm">
            ✕ Close
          </button>
        </div>
        <CurveLibrary />
      </div>
    );
  }

  const graphData = activeGraph.graph_data;

  const layoutWithGrid = {
    ...graphData.layout,
    xaxis: {
      ...(graphData.layout.xaxis as Record<string, unknown> || {}),
      showgrid: showGrid,
    },
    yaxis: {
      ...(graphData.layout.yaxis as Record<string, unknown> || {}),
      showgrid: showGrid,
    },
    autosize: true,
    margin: { t: 50, r: 30, b: 50, l: 60 },
  };

  const tabs = ['all', '2d', 'polar', '3d', 'parametric'];
  const filteredGraphs = activeTab === 'all'
    ? graphs
    : graphs.filter((g) => g.graph_data.type === activeTab);

  const copyLatex = () => {
    navigator.clipboard.writeText(activeGraph.expression);
  };

  const exportPng = () => {
    const plotEl = document.querySelector('.js-plotly-plot') as HTMLElement;
    if (plotEl) {
      // @ts-expect-error Plotly global
      window.Plotly?.downloadImage(plotEl, { format: 'png', filename: 'graph' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-surface/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-sm">Graph Panel</h3>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] px-2 py-1 rounded ${
                  activeTab === tab ? 'bg-primary text-white' : 'bg-surface-light text-gray-400'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`text-[10px] px-2 py-1 rounded ${showGrid ? 'bg-secondary/20 text-secondary' : 'bg-surface-light text-gray-500'}`}
          >
            Grid
          </button>
          <button onClick={copyLatex} className="text-[10px] px-2 py-1 rounded bg-surface-light text-gray-400 hover:text-white">
            📋 LaTeX
          </button>
          <button onClick={exportPng} className="text-[10px] px-2 py-1 rounded bg-surface-light text-gray-400 hover:text-white">
            📷 PNG
          </button>
          <button
            onClick={() => setShowCurveLib(true)}
            className="text-[10px] px-2 py-1 rounded bg-surface-light text-gray-400 hover:text-white"
          >
            📚 Curves
          </button>
          <button
            onClick={() => setActivePanel('comparison')}
            className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 p-4"
      >
        <Plot
          data={graphData.data as Plotly.Data[]}
          layout={layoutWithGrid as Partial<Plotly.Layout>}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>

      {/* Graph thumbnails */}
      {filteredGraphs.length > 1 && (
        <div className="px-4 py-3 border-t border-white/5 flex gap-2 overflow-x-auto">
          {filteredGraphs.map((graph) => (
            <button
              key={graph.id}
              onClick={() => setActiveGraphId(graph.id)}
              className={`flex-shrink-0 p-2 rounded-lg border text-[10px] text-left ${
                graph.id === activeGraphId
                  ? 'border-primary bg-primary/10'
                  : 'border-white/5 bg-surface hover:border-white/20'
              }`}
              style={{ minWidth: 120 }}
            >
              <div className="text-gray-300 truncate">{graph.expression}</div>
              <div className="text-gray-500 mt-1">{graph.graph_data.type}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
