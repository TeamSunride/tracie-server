/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

export function createEmptyMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function createDiagonalMatrix(size: number, value: number): number[][] {
  return Array.from({ length: size }, (_, i) =>
    Array(size)
      .fill(0)
      .map((__, j) => (i === j ? value : 0)),
  );
}

export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const result: number[][] = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      result[i][j] = 0;
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

export function matrixAdd(A: number[][], B: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < A.length; i++) {
    result[i] = [];
    for (let j = 0; j < A[i].length; j++) {
      result[i][j] = A[i][j] + B[i][j];
    }
  }
  return result;
}

export function transpose(matrix: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < matrix[0].length; i++) {
    result[i] = [];
    for (let j = 0; j < matrix.length; j++) {
      result[i][j] = matrix[j][i];
    }
  }
  return result;
}

export function inverse(matrix: number[][]): number[][] {
  // Inverse function for 2x2 matrix for simplicity (expand for higher dimensions if needed)
  const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  if (det === 0) {
    throw new Error('Matrix is singular and cannot be inverted');
  }

  return [
    [matrix[1][1] / det, -matrix[0][1] / det],
    [-matrix[1][0] / det, matrix[0][0] / det],
  ];
}
