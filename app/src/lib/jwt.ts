import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type JwtClaims = { sub: string; role: 'user'|'admin'; plan: 'BASIC'|'PRO'|'ULTRA'|'MEGA' };

export function signJwt(claims: JwtClaims) {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): JwtClaims | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtClaims;
  } catch {
    return null;
  }
}
