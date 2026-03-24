import Groq from 'groq-sdk';
import { toolDefinitions, toolExecutors } from '../tools/index';
import { Message, ChatResponse, PlotlyData } from '../types/index';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000,
});

const SYSTEM_PROMPT = `You are an advanced AI Math Agent. You help users with mathematical calculations, equation solving, unit conversions, matrix operations, and plotting graphs.

You have access to these tools:
- calculator: Evaluate math expressions (arithmetic, trig, logarithms, etc.)
- solve_equation: Solve equations step-by-step
- unit_converter: Convert between units (length, mass, energy, temperature, angle, pressure, data, time)
- matrix_operation: Matrix determinant, inverse, multiply, eigenvalues, transpose
- plot_function: Plot 2D, 3D, polar, and parametric functions
- compare_functions: Compare multiple functions on the same axes with intersection analysis

IMPORTANT INSTRUCTIONS:
- Always use tools when the user asks for calculations, plotting, solving, converting, or matrix operations.
- For plotting, determine the correct type (2d, 3d, polar, parametric) based on the function.
- For named curves (like "butterfly curve", "cardioid"), provide the standard formula.
- Show mathematical results using LaTeX notation when appropriate.
- After each response, suggest 3 relevant follow-up prompts.
- Be concise but thorough in explanations.
- When multiple operations are needed, call tools sequentially.`;

// Summarize tool results to avoid sending huge data arrays back to the LLM
function summarizeToolResult(name: string, result: unknown): string {
  const res = result as Record<string, unknown>;
  if (res.error) return JSON.stringify({ error: res.error });

  if (name === 'plot_function' || name === 'compare_functions') {
    // Don't send raw graph data arrays to the LLM — just confirm the plot was made
    const summary: Record<string, unknown> = { ...res };
    delete summary.graph_data;
    if (res.steps) summary.steps = res.steps;
    if (name === 'compare_functions' && res.intersections) {
      summary.intersections = res.intersections;
    }
    return JSON.stringify(summary);
  }

  // For other tools, cap the output size
  const json = JSON.stringify(result);
  if (json.length > 2000) {
    return json.slice(0, 2000) + '...(truncated)';
  }
  return json;
}

export async function runAgentLoop(
  messages: Message[]
): Promise<ChatResponse> {
  const allToolCalls: ChatResponse['tool_calls'] = [];
  let graphData: PlotlyData | undefined;
  let steps: string[] | undefined;

  // Only keep recent messages to stay within token limits
  const recentMessages = messages.slice(-10);

  const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentMessages.map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: m.content,
          tool_call_id: m.tool_call_id || '',
        };
      }
      return { role: m.role as 'user' | 'assistant', content: m.content };
    }),
  ];

  const maxIterations = 10;

  for (let i = 0; i < maxIterations; i++) {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      max_tokens: 2048,
      temperature: 0.3,
    });

    const choice = completion.choices[0];
    const message = choice.message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      // Final text response
      const followUps = extractFollowUps(message.content || '');
      return {
        message: message.content || '',
        tool_calls: allToolCalls,
        graph_data: graphData,
        steps,
        follow_up_prompts: followUps,
      };
    }

    // Process tool calls
    groqMessages.push({
      role: 'assistant',
      content: message.content || '',
      tool_calls: message.tool_calls,
    });

    for (const toolCall of message.tool_calls) {
      const fnName = toolCall.function.name;
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        args = {};
      }

      let result: unknown;
      try {
        const executor = toolExecutors[fnName];
        if (!executor) {
          throw new Error(`Unknown tool: ${fnName}`);
        }
        result = executor(args);

        // Extract special data
        const res = result as Record<string, unknown>;
        if (res.graph_data) {
          graphData = res.graph_data as PlotlyData;
        }
        if (res.steps) {
          steps = res.steps as string[];
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Tool execution failed';
        result = { error: msg };
      }

      allToolCalls.push({ name: fnName, input: args, result });

      groqMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: summarizeToolResult(fnName, result),
      });
    }
  }

  return {
    message: 'I reached the maximum number of tool calls. Here is what I found so far.',
    tool_calls: allToolCalls,
    graph_data: graphData,
    steps,
  };
}

function extractFollowUps(text: string): string[] {
  // Default follow-ups if the agent doesn't generate them
  const defaults = [
    'Plot this equation',
    'Explain the result step by step',
    'Try a different approach',
  ];

  // Try to parse follow-ups from the response
  const lines = text.split('\n');
  const followUps: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- Follow') || trimmed.startsWith('- Try') || trimmed.startsWith('- What') || trimmed.startsWith('- How') || trimmed.startsWith('- Plot') || trimmed.startsWith('- Solve') || trimmed.startsWith('- Convert')) {
      followUps.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  return followUps.length >= 2 ? followUps.slice(0, 3) : defaults;
}
