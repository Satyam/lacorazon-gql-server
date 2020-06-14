import userResolvers from './user';
import ventaResolvers from './venta';
import distribuidorResolvers from './distribuidor';
import consignaResolvers from './consigna';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
export type prismaContext = {
  req: Request & {
    currentUser: string;
  };
  res: Response;
  prisma: PrismaClient;
  permissions: string[];
};

export default [
  userResolvers,
  ventaResolvers,
  distribuidorResolvers,
  consignaResolvers,
];
