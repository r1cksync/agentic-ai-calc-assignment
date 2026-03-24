import { calculator } from './calculator';
import { solveEquation } from './solveEquation';
import { unitConverter } from './unitConverter';
import { matrixOperation } from './matrixOperation';
import { plotFunction } from './plotFunction';
import { compareFunctions } from './compareFunctions';

export const toolExecutors: Record<string, (args: Record<string, unknown>) => unknown> = {
  calculator: (args) => calculator(args as { expression: string }),
  solve_equation: (args) => solveEquation(args as { equation: string; variable: string }),
  unit_converter: (args) => unitConverter(args as { value: number; from_unit: string; to_unit: string }),
  matrix_operation: (args) => matrixOperation(args as { matrix_a: number[][]; matrix_b?: number[][]; operation: 'determinant' | 'inverse' | 'multiply' | 'eigenvalues' | 'transpose' }),
  plot_function: (args) => plotFunction(args as { expression: string; type: '2d' | '3d' | 'parametric' | 'polar'; x_range?: [number, number]; y_range?: [number, number]; curve_type?: string }),
  compare_functions: (args) => compareFunctions(args as { expressions: string[]; x_range: [number, number] }),
};

export const toolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'calculator',
      description: 'Evaluate a mathematical expression. Supports arithmetic, trigonometry, logarithms, powers, factorials, etc.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'The math expression to evaluate, e.g. "2^10 + sqrt(144)"' },
        },
        required: ['expression'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'solve_equation',
      description: 'Solve an equation for a variable. Returns step-by-step solution.',
      parameters: {
        type: 'object',
        properties: {
          equation: { type: 'string', description: 'The equation to solve, e.g. "x^2 - 5*x + 6 = 0"' },
          variable: { type: 'string', description: 'The variable to solve for, e.g. "x"' },
        },
        required: ['equation', 'variable'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'unit_converter',
      description: 'Convert a value from one unit to another. Supports length, mass, time, energy, temperature, angle, pressure, data storage.',
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'The numeric value to convert' },
          from_unit: { type: 'string', description: 'Source unit (e.g. "km", "lb", "J", "celsius", "deg", "MB")' },
          to_unit: { type: 'string', description: 'Target unit' },
        },
        required: ['value', 'from_unit', 'to_unit'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'matrix_operation',
      description: 'Perform matrix operations: determinant, inverse, multiply, eigenvalues, transpose.',
      parameters: {
        type: 'object',
        properties: {
          matrix_a: { type: 'array', description: '2D array representing matrix A', items: { type: 'array', items: { type: 'number' } } },
          matrix_b: { type: 'array', description: '2D array representing matrix B (optional, needed for multiply)', items: { type: 'array', items: { type: 'number' } } },
          operation: { type: 'string', enum: ['determinant', 'inverse', 'multiply', 'eigenvalues', 'transpose'], description: 'The operation to perform' },
        },
        required: ['matrix_a', 'operation'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'plot_function',
      description: 'Plot a mathematical function. Returns data for rendering a graph. Use for 2D, 3D surfaces, polar, and parametric plots.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'The expression to plot. For 2D: f(x). For 3D: f(x,y). For polar: f(theta). For parametric: "x(t), y(t)".' },
          type: { type: 'string', enum: ['2d', '3d', 'parametric', 'polar'], description: 'The type of plot' },
          x_range: { type: 'array', items: { type: 'number' }, description: 'Range for x axis [min, max]' },
          y_range: { type: 'array', items: { type: 'number' }, description: 'Range for y axis [min, max] (for 3D)' },
          curve_type: { type: 'string', description: 'Optional named curve type like "parabola", "helix", etc.' },
        },
        required: ['expression', 'type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'compare_functions',
      description: 'Compare multiple functions by plotting them on the same axes. Finds intersection points numerically.',
      parameters: {
        type: 'object',
        properties: {
          expressions: { type: 'array', items: { type: 'string' }, description: 'Array of function expressions to compare (max 4)' },
          x_range: { type: 'array', items: { type: 'number' }, description: 'Range for x axis [min, max]' },
        },
        required: ['expressions', 'x_range'],
      },
    },
  },
];
