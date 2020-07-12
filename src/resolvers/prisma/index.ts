import userResolvers from './user';
import ventaResolvers from './venta';
import distribuidorResolvers from './distribuidor';
import consignaResolvers from './consigna';
import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
export type prismaContext = {
  req: Request & {
    currentUser: string;
  };
  res: Response;
  prisma: PrismaClient;
  permissions: string[];
};

import type { Context } from '..';

export async function getContext(): Promise<Context | undefined> {
  console.log('Start with Prisma');
  const prisma = new PrismaClient();
  if (prisma)
    return {
      resolvers: [
        userResolvers,
        ventaResolvers,
        distribuidorResolvers,
        consignaResolvers,
      ],
      context: { prisma },
    };
}
