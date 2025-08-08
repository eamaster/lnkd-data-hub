import { AuthUser, Env, Plan } from '../types';

const PLAN_LIMITS: Record<Plan, { perMinute: number; perDay: number }> = {
  BASIC: { perMinute: 10, perDay: 500 },
  PRO: { perMinute: 30, perDay: 5000 },
  ULTRA: { perMinute: 60, perDay: 20000 },
  MEGA: { perMinute: 120, perDay: 100000 },
};

function keys(user: AuthUser, now: Date) {
  const minuteBucket = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}`;
  const dayBucket = `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}`;
  return {
    minuteKey: `rl:${user.userId}:m:${minuteBucket}`,
    dayKey: `rl:${user.userId}:d:${dayBucket}`,
  };
}

export async function enforceRateLimit(env: Env, user: AuthUser): Promise<{ ok: true } | { ok: false; retryAfter: number; message: string }>{
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.BASIC;
  const now = new Date();
  const { minuteKey, dayKey } = keys(user, now);

  const [minute, day] = await Promise.all([
    env.LINKEDIN_HUB_KV.get<number>(minuteKey, 'json'),
    env.LINKEDIN_HUB_KV.get<number>(dayKey, 'json'),
  ]);

  const minuteCount = (minute || 0) + 1;
  const dayCount = (day || 0) + 1;

  if (minuteCount > limits.perMinute) {
    return { ok: false, retryAfter: 60, message: 'Per-minute quota exceeded' };
  }
  if (dayCount > limits.perDay) {
    return { ok: false, retryAfter: 24 * 3600, message: 'Daily quota exceeded' };
  }

  const minuteTtl = 60; // seconds
  const dayTtl = 24 * 3600; // seconds
  await Promise.all([
    env.LINKEDIN_HUB_KV.put(minuteKey, JSON.stringify(minuteCount), { expirationTtl: minuteTtl }),
    env.LINKEDIN_HUB_KV.put(dayKey, JSON.stringify(dayCount), { expirationTtl: dayTtl }),
  ]);

  return { ok: true };
}
