import * as math from 'mathjs';
import { PlotlyData } from '../types/index';

export function compareFunctions(args: {
  expressions: string[];
  x_range: [number, number];
}): {
  graph_data: PlotlyData;
  intersections: { x: number; y: number }[];
  steps: string[];
} {
  const { expressions, x_range } = args;
  const [xMin, xMax] = x_range;
  const numPoints = 500;
  const dx = (xMax - xMin) / (numPoints - 1);
  const steps: string[] = [];
  const colors = ['#06B6D4', '#7C3AED', '#F59E0B', '#EF4444', '#10B981'];

  steps.push(`Comparing ${expressions.length} functions on [${xMin}, ${xMax}]`);

  const datasets: { x: number[]; y: number[]; compiled: math.EvalFunction }[] = expressions.map((expr) => ({
    x: [],
    y: [],
    compiled: math.compile(expr),
  }));

  for (let i = 0; i < numPoints; i++) {
    const xVal = xMin + i * dx;
    datasets.forEach((ds) => {
      try {
        const yVal = ds.compiled.evaluate({ x: xVal });
        if (typeof yVal === 'number' && isFinite(yVal)) {
          ds.x.push(xVal);
          ds.y.push(yVal);
        }
      } catch {
        // skip
      }
    });
  }

  // Find intersections between all pairs
  const intersections: { x: number; y: number }[] = [];
  for (let a = 0; a < expressions.length - 1; a++) {
    for (let b = a + 1; b < expressions.length; b++) {
      steps.push(`Finding intersections between f${a + 1}(x) = ${expressions[a]} and f${b + 1}(x) = ${expressions[b]}`);
      for (let i = 0; i < numPoints - 1; i++) {
        const xVal = xMin + i * dx;
        const xNext = xVal + dx;
        try {
          const diff1 = datasets[a].compiled.evaluate({ x: xVal }) - datasets[b].compiled.evaluate({ x: xVal });
          const diff2 = datasets[a].compiled.evaluate({ x: xNext }) - datasets[b].compiled.evaluate({ x: xNext });

          if (typeof diff1 === 'number' && typeof diff2 === 'number' && diff1 * diff2 < 0) {
            // Bisection
            let lo = xVal, hi = xNext;
            for (let j = 0; j < 50; j++) {
              const mid = (lo + hi) / 2;
              const dMid = datasets[a].compiled.evaluate({ x: mid }) - datasets[b].compiled.evaluate({ x: mid });
              if (typeof dMid === 'number') {
                if (Math.abs(dMid) < 1e-10) break;
                if (dMid * diff1 < 0) hi = mid;
                else lo = mid;
              }
            }
            const ix = Math.round(((lo + hi) / 2) * 1e6) / 1e6;
            const iy = Math.round(datasets[a].compiled.evaluate({ x: ix }) * 1e6) / 1e6;
            intersections.push({ x: ix, y: iy });
            steps.push(`  Intersection at (${ix}, ${iy})`);
          }
        } catch {
          // skip
        }
      }
    }
  }

  const traces = expressions.map((expr, i) => ({
    x: datasets[i].x,
    y: datasets[i].y,
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: expr,
    line: { color: colors[i % colors.length], width: 2 },
  }));

  if (intersections.length > 0) {
    traces.push({
      x: intersections.map((p) => p.x),
      y: intersections.map((p) => p.y),
      type: 'scatter',
      mode: 'markers' as const,
      name: 'Intersections',
      marker: { color: '#EF4444', size: 10, symbol: 'circle' } as unknown as Record<string, unknown>,
      line: undefined as unknown as Record<string, unknown>,
    });
  }

  return {
    graph_data: {
      data: traces as PlotlyData['data'],
      layout: {
        title: `Comparison: ${expressions.join(' vs ')}`,
        xaxis: { title: 'x', gridcolor: '#333' },
        yaxis: { title: 'y', gridcolor: '#333' },
        paper_bgcolor: '#1A1A2E',
        plot_bgcolor: '#0F0F1A',
        font: { color: '#fff' },
        showlegend: true,
      },
      type: '2d',
    },
    intersections,
    steps,
  };
}
