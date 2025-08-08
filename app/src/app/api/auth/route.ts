import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) return NextResponse.json({ code: 400, message: 'Missing credentials' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return NextResponse.json({ code: 401, message: 'Invalid credentials' }, { status: 401 });
  const ok = await bcrypt.compare(body.password, user.password);
  if (!ok) return NextResponse.json({ code: 401, message: 'Invalid credentials' }, { status: 401 });
  const token = signJwt({ sub: user.id, role: (user.role as any) || 'user', plan: (user.plan as any) || 'BASIC' });
  return NextResponse.json({ token });
}
