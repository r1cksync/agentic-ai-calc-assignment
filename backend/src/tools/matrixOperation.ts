import * as math from 'mathjs';

type MatrixOp = 'determinant' | 'inverse' | 'multiply' | 'eigenvalues' | 'transpose';

export function matrixOperation(args: {
  matrix_a: number[][];
  matrix_b?: number[][];
  operation: MatrixOp;
}): {
  result: unknown;
  steps: string[];
} {
  const { matrix_a, matrix_b, operation } = args;
  const steps: string[] = [];
  const A = math.matrix(matrix_a);

  steps.push(`Matrix A: ${math.format(A)}`);
  if (matrix_b) {
    steps.push(`Matrix B: ${math.format(math.matrix(matrix_b))}`);
  }
  steps.push(`Operation: ${operation}`);

  switch (operation) {
    case 'determinant': {
      const det = math.det(A);
      steps.push(`det(A) = ${det}`);
      steps.push(
        det === 0
          ? 'The matrix is singular (non-invertible). Geometrically, it collapses space to a lower dimension.'
          : `|det(A)| = ${Math.abs(det)} represents the area/volume scaling factor of the linear transformation.`
      );
      return { result: det, steps };
    }

    case 'inverse': {
      const det = math.det(A);
      if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is singular, cannot compute inverse (determinant ≈ 0).');
      }
      steps.push(`det(A) = ${det} ≠ 0, so inverse exists.`);
      const inv = math.inv(A);
      steps.push(`A⁻¹ = ${math.format(inv)}`);
      steps.push(`Verification: A × A⁻¹ = ${math.format(math.multiply(A, inv))}`);
      return { result: (inv as math.Matrix).toArray(), steps };
    }

    case 'multiply': {
      if (!matrix_b) throw new Error('Matrix B is required for multiplication.');
      const B = math.matrix(matrix_b);
      const sizeA = A.size();
      const sizeB = B.size();
      steps.push(`A is ${sizeA[0]}×${sizeA[1]}, B is ${sizeB[0]}×${sizeB[1]}`);
      if (sizeA[1] !== sizeB[0]) {
        throw new Error(`Cannot multiply: A columns (${sizeA[1]}) ≠ B rows (${sizeB[0]})`);
      }
      const result = math.multiply(A, B);
      steps.push(`A × B = ${math.format(result)}`);
      return { result: (result as math.Matrix).toArray(), steps };
    }

    case 'eigenvalues': {
      const eig = math.eigs(A);
      const values = eig.values.toArray();
      steps.push(`Eigenvalues: ${math.format(eig.values)}`);
      if (eig.eigenvectors) {
        eig.eigenvectors.forEach((ev: { value: unknown; vector: math.Matrix }, i: number) => {
          steps.push(`λ${i + 1} = ${math.format(ev.value)}, eigenvector: ${math.format(ev.vector)}`);
        });
      }
      return {
        result: {
          eigenvalues: values,
          eigenvectors: eig.eigenvectors?.map((ev: { value: unknown; vector: math.Matrix }) => ({
            value: ev.value,
            vector: ev.vector.toArray(),
          })),
        },
        steps,
      };
    }

    case 'transpose': {
      const result = math.transpose(A);
      steps.push(`Aᵀ = ${math.format(result)}`);
      return { result: (result as math.Matrix).toArray(), steps };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
