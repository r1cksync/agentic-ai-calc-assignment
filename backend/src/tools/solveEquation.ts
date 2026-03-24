import * as math from 'mathjs';

export function solveEquation(args: { equation: string; variable: string }): {
  result: string[];
  steps: string[];
} {
  const { equation, variable } = args;
  const steps: string[] = [];

  steps.push(`Solving: ${equation} for ${variable}`);

  try {
    let lhs: string, rhs: string;
    if (equation.includes('=')) {
      const parts = equation.split('=');
      lhs = parts[0].trim();
      rhs = parts[1].trim();
      steps.push(`Left side: ${lhs}`);
      steps.push(`Right side: ${rhs}`);
    } else {
      lhs = equation;
      rhs = '0';
      steps.push(`Setting expression equal to 0: ${lhs} = 0`);
    }

    const expr = `(${lhs}) - (${rhs})`;
    steps.push(`Rearranged: ${expr} = 0`);

    const node = math.parse(expr);
    const simplified = math.simplify(node);
    steps.push(`Simplified: ${simplified.toString()} = 0`);

    // Try to rationalize as polynomial and find roots
    const compiled = math.compile(expr);
    const roots: string[] = [];

    // Numerical approach: scan for sign changes
    const scanPoints: number[] = [];
    for (let x = -100; x <= 100; x += 0.1) {
      scanPoints.push(Math.round(x * 10) / 10);
    }

    for (let i = 0; i < scanPoints.length - 1; i++) {
      const x1 = scanPoints[i];
      const x2 = scanPoints[i + 1];
      try {
        const y1 = compiled.evaluate({ [variable]: x1 });
        const y2 = compiled.evaluate({ [variable]: x2 });

        if (typeof y1 === 'number' && typeof y2 === 'number') {
          if (Math.abs(y1) < 1e-10) {
            const rootStr = String(Math.round(x1 * 1e6) / 1e6);
            if (!roots.includes(rootStr)) roots.push(rootStr);
          } else if (y1 * y2 < 0) {
            // Bisection
            let lo = x1, hi = x2;
            for (let j = 0; j < 60; j++) {
              const mid = (lo + hi) / 2;
              const ym = compiled.evaluate({ [variable]: mid });
              if (typeof ym === 'number') {
                if (Math.abs(ym) < 1e-12) break;
                if (ym * y1 < 0) hi = mid;
                else lo = mid;
              }
            }
            const root = Math.round(((lo + hi) / 2) * 1e6) / 1e6;
            const rootStr = String(root);
            if (!roots.includes(rootStr)) roots.push(rootStr);
          }
        }
      } catch {
        // skip
      }
    }

    if (roots.length > 0) {
      steps.push(`Found roots by numerical analysis:`);
      roots.forEach((r, i) => {
        steps.push(`  ${variable}_{${i + 1}} = ${r}`);
      });

      // Verify
      roots.forEach((r) => {
        const val = compiled.evaluate({ [variable]: parseFloat(r) });
        steps.push(`Verification: f(${r}) = ${typeof val === 'number' ? val.toExponential(4) : val}`);
      });
    } else {
      steps.push('No real roots found in the range [-100, 100]');
    }

    return {
      result: roots.length > 0 ? roots : ['No real solutions found'],
      steps,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Solve error: ${msg}`);
  }
}
