export function assertExist<T>(value: T, text = 'value'): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(`Expected ${text} to exist`);
  }
}
