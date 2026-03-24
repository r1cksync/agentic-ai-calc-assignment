'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const navItems = [
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/notebook', label: 'Notebook', icon: '📝' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, graphs, clearSession } = useStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 64 }}
      className="fixed left-0 top-0 h-full bg-surface border-r border-white/5 z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold">π</div>
              <span className="font-semibold text-sm">Math Agent</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white p-1"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface-light'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Graphs Tab */}
        {sidebarOpen && graphs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <p className="text-[10px] text-gray-600 uppercase tracking-wider px-3 mb-2">
              Graphs ({graphs.length})
            </p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {graphs.slice(-10).reverse().map((graph) => (
                <Link
                  key={graph.id}
                  href="/chat"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-all"
                >
                  <span className="text-sm">📈</span>
                  <span className="text-[11px] truncate">{graph.expression}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-surface-light transition-all text-sm"
          >
            🏠 Home
          </Link>
          <button
            onClick={clearSession}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm"
          >
            🗑️ Clear Session
          </button>
        </div>
      )}
    </motion.aside>
  );
}
