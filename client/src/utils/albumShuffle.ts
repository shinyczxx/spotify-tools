// Album shuffle utility functions

export function shuffle<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function clearMessages(setError: (msg: string | null) => void, setSuccess: (msg: string | null) => void) {
  setError(null);
  setSuccess(null);
}
