export type Env = {
  RAPIDAPI_KEY: string;
  RAPIDAPI_HOST: string;
  JWT_SECRET: string;
  LINKEDIN_HUB_KV: KVNamespace;
  CACHE_TTL_SECONDS?: number;
};

export type JsonError = { code: number; message: string; details?: unknown };

export type Plan = 'BASIC' | 'PRO' | 'ULTRA' | 'MEGA';

export type AuthUser = { userId: string; role: 'user' | 'admin'; plan: Plan };
