'use client';

import Sidebar from '@/components/ui/Sidebar';
import NotebookPanel from '@/components/ui/NotebookPanel';
import { useStore } from '@/store/useStore';

export default function NotebookPage() {
  const { sidebarOpen } = useStore();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <NotebookPanel />
      </div>
    </div>
  );
}
