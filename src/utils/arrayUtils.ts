export function isArrayNotEmpty<T, TArray extends ReadonlyArray<T>>(
  array: TArray | null | undefined,
): array is TArray {
  return Array.isArray(array) && array.length > 0;
}
