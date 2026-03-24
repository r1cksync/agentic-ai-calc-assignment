'use client';

import { Suspense } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import ChatPanel from '@/components/chat/ChatPanel';
import GraphPanel from '@/components/graphs/GraphPanel';
import ComparisonMode from '@/components/graphs/ComparisonMode';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

function ChatPageContent() {
  const { activePanel, sidebarOpen } = useStore();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <div className={`flex-1 flex transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Chat Panel - Left Side */}
        <div className="w-[45%] min-w-[380px] border-r border-white/5">
          <ChatPanel />
        </div>

        {/* Right Panel - Graph / Comparison */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activePanel === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0"
              >
                <GraphPanel />
              </motion.div>
            )}
            {activePanel === 'comparison' && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0"
              >
                <ComparisonMode />
              </motion.div>
            )}
            {activePanel === 'chat' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">Graphs and results will appear here</p>
                  <p className="text-sm mt-2">Try asking me to plot a function!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center text-gray-400">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
