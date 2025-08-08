import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) return NextResponse.json({ code: 400, message: 'Missing credentials' }, { status: 400 });
  const hash = await bcrypt.hash(body.password, 10);
  try {
    const user = await prisma.user.create({ data: { email: body.email, password: hash } });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e) {
    return NextResponse.json({ code: 400, message: 'User exists' }, { status: 400 });
  }
}
