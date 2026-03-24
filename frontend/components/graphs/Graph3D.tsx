'use client';

import dynamic from 'next/dynamic';
import { PlotlyGraphData } from '@/lib/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
  data: PlotlyGraphData;
}

export default function Graph3D({ data }: Props) {
  return (
    <Plot
      data={data.data as Plotly.Data[]}
      layout={{
        ...data.layout,
        autosize: true,
        margin: { t: 50, r: 30, b: 50, l: 60 },
      } as Partial<Plotly.Layout>}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
