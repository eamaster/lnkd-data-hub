let current = 0;
const MAX_CONCURRENCY = 5;

export async function withConcurrency<T>(fn: () => Promise<T>): Promise<T> {
  while (current >= MAX_CONCURRENCY) {
    await new Promise((r) => setTimeout(r, 50));
  }
  current++;
  try {
    return await fn();
  } finally {
    current--;
  }
}
