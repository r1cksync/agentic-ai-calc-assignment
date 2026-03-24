'use client';

import { useStore } from '@/store/useStore';
import { useMemo } from 'react';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function SessionHeatmap() {
  const { queries } = useStore();

  const heatData = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    queries.forEach((q) => {
      const d = new Date(q.timestamp);
      grid[d.getDay()][d.getHours()]++;
    });

    return grid;
  }, [queries]);

  const maxVal = Math.max(1, ...heatData.flat());

  return (
    <div>
      <h3 className="font-semibold mb-4">Query Activity Heatmap</h3>
      {queries.length === 0 ? (
        <p className="text-gray-500 text-sm">No data yet. Start making queries!</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            {/* Hour labels */}
            <div className="flex gap-1 ml-10">
              {hours.map((h) => (
                <div key={h} className="w-5 text-[8px] text-gray-600 text-center">
                  {h % 4 === 0 ? `${h}h` : ''}
                </div>
              ))}
            </div>
            {days.map((day, di) => (
              <div key={day} className="flex items-center gap-1">
                <span className="w-8 text-[10px] text-gray-500 text-right">{day}</span>
                {hours.map((h) => {
                  const val = heatData[di][h];
                  const intensity = val / maxVal;
                  return (
                    <div
                      key={h}
                      className="w-5 h-5 rounded-sm"
                      style={{
                        backgroundColor: val === 0
                          ? '#1A1A2E'
                          : `rgba(124, 58, 237, ${0.2 + intensity * 0.8})`,
                      }}
                      title={`${day} ${h}:00 — ${val} queries`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
