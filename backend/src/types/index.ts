export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatRequest {
  messages: Message[];
  session_id: string;
}

export interface ToolResult {
  result: unknown;
  steps?: string[];
  graph_data?: PlotlyData;
}

export interface PlotlyData {
  data: PlotlyTrace[];
  layout: Record<string, unknown>;
  type: '2d' | '3d' | 'polar' | 'parametric';
}

export interface PlotlyTrace {
  x?: number[];
  y?: number[];
  z?: number[];
  r?: number[];
  theta?: number[];
  type: string;
  mode?: string;
  name?: string;
  marker?: Record<string, unknown>;
  line?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  tool_calls: {
    name: string;
    input: Record<string, unknown>;
    result: unknown;
  }[];
  graph_data?: PlotlyData;
  steps?: string[];
  follow_up_prompts?: string[];
}

export interface ExportRequest {
  notebook_content: string;
  graphs: string[];
}

export interface CurveDefinition {
  name: string;
  formula: string;
  description: string;
  type: '2d' | '3d' | 'polar' | 'parametric';
  paramRange?: [number, number];
  defaultParams?: Record<string, number>;
}
