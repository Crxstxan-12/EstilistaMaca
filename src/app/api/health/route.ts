import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

function resumirDatabaseUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.host,
      hasPgbouncer: parsed.searchParams.get('pgbouncer') === 'true',
      hasConnectionLimit: parsed.searchParams.has('connection_limit'),
    };
  } catch {
    return { malformed: true };
  }
}

export async function GET() {
  const response = {
    ok: true,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      databaseUrl: resumirDatabaseUrl(process.env.DATABASE_URL),
    },
    db: {
      connected: false,
      error: null as string | null,
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    response.db.connected = true;
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    response.ok = false;
    response.db.error = error instanceof Error ? error.message : 'unknown_error';
    return NextResponse.json(response, { status: 500 });
  }
}
