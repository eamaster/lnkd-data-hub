export type KvLike = {
  get<T>(key: string, type?: 'json' | 'text' | 'arrayBuffer'): Promise<T | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

const store = new Map<string, string>();

export function kvShim(): KvLike {
  return {
    async get(key, type) {
      const val = store.get(key);
      if (val == null) return null;
      if (type === 'json') {
        try { return JSON.parse(val); } catch { return null as any; }
      }
      return val as any;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
  };
}
