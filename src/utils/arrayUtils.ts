export function isArrayNotEmpty<T, TArray extends ReadonlyArray<T>>(
  array: TArray | null | undefined,
): array is TArray {
  return Array.isArray(array) && array.length > 0;
}

export function areArraysEqual<T>(...arrays: Array<Array<T>>) {
  // Take first array for comparison to the rest
  const [array0, ...testArrays] = arrays;

  if (testArrays.some((testArray) => testArray.length !== array0.length)) {
    return false;
  }

  for (let testArrayIndex = 0; testArrayIndex < testArrays.length; testArrayIndex += 1) {
    const testArray = testArrays[testArrayIndex];

    for (let i = 0; i < testArray.length; i += 1) {
      if (testArray[i] !== array0[i]) {
        return false;
      }
    }
  }

  return true;
}
