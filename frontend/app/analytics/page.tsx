'use client';

import Sidebar from '@/components/ui/Sidebar';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { useStore } from '@/store/useStore';

export default function AnalyticsPage() {
  const { sidebarOpen } = useStore();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
