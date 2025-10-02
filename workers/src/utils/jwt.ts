import { AuthUser } from '../types';

export function parseBearer(authHeader?: string): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

// For demo only: parse a JWT without signature verification.
// In production, verify signature with a stable library that supports Workers runtime (e.g., jose).
export function decodeJwtWithoutVerify(token: string): any | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAuthUserFromRequest(req: Request): AuthUser | null {
  const token = parseBearer(req.headers.get('authorization') || undefined);
  if (!token) return null;
  const decoded = decodeJwtWithoutVerify(token);
  if (!decoded || !decoded.sub) return null;
  return {
    userId: decoded.sub as string,
    role: (decoded.role as 'user' | 'admin') || 'user',
    plan: (decoded.plan as any) || 'BASIC',
  };
}
