import { PrismaClient } from '@prisma/client';
import resolvers from './resolvers/prisma';

// import type { QueryEvent } from '@prisma/client';

import type { Context } from '.';

export async function contextPrisma(): Promise<Context | undefined> {
  console.log('Start with Prisma');
  const prisma = new PrismaClient();
  process.on('SIGTERM', () => {
    // I haven't seen it called.
    // It was meant to avoid the error message on test end.
    console.log('*** disconnecting ***');
    prisma.disconnect();
  });
  if (prisma) return { resolvers, context: { prisma } };
}
