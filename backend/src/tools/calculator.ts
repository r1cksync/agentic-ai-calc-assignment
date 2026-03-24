import * as math from 'mathjs';

export function calculator(args: { expression: string }): { result: string; steps: string[] } {
  const { expression } = args;
  const steps: string[] = [];

  steps.push(`Input expression: ${expression}`);

  try {
    const node = math.parse(expression);
    steps.push(`Parsed expression: ${node.toString()}`);

    const simplified = math.simplify(expression);
    if (simplified.toString() !== expression) {
      steps.push(`Simplified: ${simplified.toString()}`);
    }

    const result = math.evaluate(expression);
    steps.push(`Result: ${result}`);

    return {
      result: typeof result === 'object' ? math.format(result, { precision: 14 }) : String(result),
      steps,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Calculator error: ${msg}`);
  }
}
