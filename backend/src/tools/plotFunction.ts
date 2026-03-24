import * as math from 'mathjs';
import { PlotlyData } from '../types/index';

export function plotFunction(args: {
  expression: string;
  type: '2d' | '3d' | 'parametric' | 'polar';
  x_range?: [number, number];
  y_range?: [number, number];
  curve_type?: string;
}): { graph_data: PlotlyData; steps: string[] } {
  const { expression, type, x_range = [-10, 10], y_range = [-10, 10], curve_type } = args;
  const steps: string[] = [];
  steps.push(`Plotting: ${expression} (type: ${type})`);

  if (type === '2d') {
    return plot2D(expression, x_range, steps);
  } else if (type === 'polar') {
    return plotPolar(expression, steps);
  } else if (type === '3d') {
    return plot3D(expression, x_range, y_range, steps);
  } else if (type === 'parametric') {
    return plotParametric(expression, x_range, steps);
  }

  throw new Error(`Unsupported plot type: ${type}`);
}

function plot2D(expression: string, xRange: [number, number], steps: string[]): { graph_data: PlotlyData; steps: string[] } {
  const numPoints = 500;
  const [xMin, xMax] = xRange;
  const dx = (xMax - xMin) / (numPoints - 1);
  const x: number[] = [];
  const y: number[] = [];
  const compiled = math.compile(expression);

  for (let i = 0; i < numPoints; i++) {
    const xVal = xMin + i * dx;
    try {
      const yVal = compiled.evaluate({ x: xVal });
      if (typeof yVal === 'number' && isFinite(yVal)) {
        x.push(xVal);
        y.push(yVal);
      }
    } catch {
      // skip
    }
  }

  steps.push(`Generated ${x.length} data points on [${xMin}, ${xMax}]`);

  return {
    graph_data: {
      data: [{
        x, y,
        type: 'scatter',
        mode: 'lines',
        name: expression,
        line: { color: '#06B6D4', width: 2 },
      }],
      layout: {
        title: `y = ${expression}`,
        xaxis: { title: 'x', gridcolor: '#333' },
        yaxis: { title: 'y', gridcolor: '#333' },
        paper_bgcolor: '#1A1A2E',
        plot_bgcolor: '#0F0F1A',
        font: { color: '#fff' },
      },
      type: '2d',
    },
    steps,
  };
}

function plotPolar(expression: string, steps: string[]): { graph_data: PlotlyData; steps: string[] } {
  const numPoints = 720;
  const r: number[] = [];
  const theta: number[] = [];
  const compiled = math.compile(expression);

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * 4 * Math.PI;
    try {
      const rVal = compiled.evaluate({ theta: t, t: t });
      if (typeof rVal === 'number' && isFinite(rVal)) {
        r.push(rVal);
        theta.push((t * 180) / Math.PI);
      }
    } catch {
      // skip
    }
  }

  steps.push(`Generated ${r.length} polar data points over [0, 4π]`);

  return {
    graph_data: {
      data: [{
        r, theta,
        type: 'scatterpolar',
        mode: 'lines',
        name: expression,
        line: { color: '#7C3AED', width: 2 },
      }],
      layout: {
        title: `r = ${expression}`,
        polar: {
          bgcolor: '#0F0F1A',
          radialaxis: { gridcolor: '#333', color: '#fff' },
          angularaxis: { gridcolor: '#333', color: '#fff' },
        },
        paper_bgcolor: '#1A1A2E',
        font: { color: '#fff' },
      },
      type: 'polar',
    },
    steps,
  };
}

function plot3D(expression: string, xRange: [number, number], yRange: [number, number], steps: string[]): { graph_data: PlotlyData; steps: string[] } {
  const numPoints = 50;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const dx = (xMax - xMin) / (numPoints - 1);
  const dy = (yMax - yMin) / (numPoints - 1);

  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];
  const compiled = math.compile(expression);

  for (let i = 0; i < numPoints; i++) x.push(xMin + i * dx);
  for (let j = 0; j < numPoints; j++) y.push(yMin + j * dy);

  for (let j = 0; j < numPoints; j++) {
    const row: number[] = [];
    for (let i = 0; i < numPoints; i++) {
      try {
        const val = compiled.evaluate({ x: x[i], y: y[j] });
        row.push(typeof val === 'number' && isFinite(val) ? val : 0);
      } catch {
        row.push(0);
      }
    }
    z.push(row);
  }

  steps.push(`Generated ${numPoints}×${numPoints} surface grid`);

  return {
    graph_data: {
      data: [{
        x, y, z: z as unknown as number[],
        type: 'surface',
        colorscale: 'Viridis',
      }],
      layout: {
        title: `z = ${expression}`,
        scene: {
          xaxis: { title: 'x', gridcolor: '#333', color: '#fff' },
          yaxis: { title: 'y', gridcolor: '#333', color: '#fff' },
          zaxis: { title: 'z', gridcolor: '#333', color: '#fff' },
          bgcolor: '#0F0F1A',
        },
        paper_bgcolor: '#1A1A2E',
        font: { color: '#fff' },
      },
      type: '3d',
    },
    steps,
  };
}

function plotParametric(expression: string, tRange: [number, number], steps: string[]): { graph_data: PlotlyData; steps: string[] } {
  const numPoints = 500;
  const [tMin, tMax] = tRange;
  const dt = (tMax - tMin) / (numPoints - 1);
  const x: number[] = [];
  const y: number[] = [];

  // expression should be like "cos(t), sin(t)" or "t - sin(t), 1 - cos(t)"
  const parts = expression.split(',').map((s) => s.trim());
  if (parts.length < 2) {
    throw new Error('Parametric expression must be "x(t), y(t)" format');
  }

  const xExpr = math.compile(parts[0]);
  const yExpr = math.compile(parts[1]);

  for (let i = 0; i < numPoints; i++) {
    const t = tMin + i * dt;
    try {
      const xVal = xExpr.evaluate({ t });
      const yVal = yExpr.evaluate({ t });
      if (typeof xVal === 'number' && isFinite(xVal) && typeof yVal === 'number' && isFinite(yVal)) {
        x.push(xVal);
        y.push(yVal);
      }
    } catch {
      // skip
    }
  }

  steps.push(`Generated ${x.length} parametric points for t ∈ [${tMin}, ${tMax}]`);

  return {
    graph_data: {
      data: [{
        x, y,
        type: 'scatter',
        mode: 'lines',
        name: expression,
        line: { color: '#06B6D4', width: 2 },
      }],
      layout: {
        title: `Parametric: ${expression}`,
        xaxis: { title: 'x', gridcolor: '#333' },
        yaxis: { title: 'y', gridcolor: '#333', scaleanchor: 'x' },
        paper_bgcolor: '#1A1A2E',
        plot_bgcolor: '#0F0F1A',
        font: { color: '#fff' },
      },
      type: 'parametric',
    },
    steps,
  };
}
