export function findGreatestCommonDivisor(a: number, b: number): number {
  if (a % 1 > 0 || b % 1 > 0) {
    throw Error(`a and b must be integers. a: ${a}, b: ${b}.`);
  }
  if (b === 0) {
    return Math.abs(a);
  }
  return findGreatestCommonDivisor(b, a % b);
}

export function findLowestCommonMultiple(numbers: Array<number>): number {
  if (numbers.some((n) => n % 1 > 0)) {
    throw Error('numbers must be integers.');
  }
  return numbers.reduce((a, b) => (a / findGreatestCommonDivisor(a, b)) * b, 1);
}
