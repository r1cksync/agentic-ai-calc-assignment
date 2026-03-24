export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tool_calls?: ToolCallResult[];
  graph_data?: PlotlyGraphData;
  steps?: string[];
  follow_up_prompts?: string[];
}

export interface ToolCallResult {
  name: string;
  input: Record<string, unknown>;
  result: unknown;
}

export interface PlotlyGraphData {
  data: PlotlyTrace[];
  layout: Record<string, unknown>;
  type: '2d' | '3d' | 'polar' | 'parametric';
}

export interface PlotlyTrace {
  x?: number[];
  y?: number[];
  z?: number[] | number[][];
  r?: number[];
  theta?: number[];
  type: string;
  mode?: string;
  name?: string;
  marker?: Record<string, unknown>;
  line?: Record<string, unknown>;
  colorscale?: string;
}

export interface SessionData {
  session_id: string;
  messages: Message[];
  graphs: GraphEntry[];
  queries: QueryRecord[];
  startTime: number;
}

export interface GraphEntry {
  id: string;
  message_id: string;
  graph_data: PlotlyGraphData;
  expression: string;
  timestamp: number;
  thumbnail?: string;
}

export interface QueryRecord {
  id: string;
  prompt: string;
  timestamp: number;
  tool_used: string | null;
  result_type: 'arithmetic' | 'graphing' | 'equation' | 'unit_conversion' | 'matrix' | 'general';
  response_time: number;
}

export interface CurveDefinition {
  name: string;
  formula: string;
  description: string;
  type: '2d' | '3d' | 'polar' | 'parametric';
  paramRange?: [number, number];
  defaultParams?: Record<string, number>;
}

export interface ComparisonData {
  expressions: string[];
  graph_data: PlotlyGraphData;
  intersections: { x: number; y: number }[];
}
