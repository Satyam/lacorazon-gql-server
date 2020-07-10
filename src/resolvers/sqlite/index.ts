import userResolvers from './user';
import ventaResolvers from './venta';
import distribuidorResolvers from './distribuidor';
import consignaResolvers from './consigna';
import type { Database } from 'sqlite';
import type { Request, Response } from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export type sqlContext = {
  req: Request & {
    currentUser: string;
  };
  res: Response;
  db: Database;
  permissions: string[];
};

import type { Context } from '..';

export async function getContext(): Promise<Context | undefined> {
  console.log('Start with SQLite');
  const sqliteFile = process.env.SQLITE_FILE;
  if (sqliteFile) {
    const db = await open({
      filename: sqliteFile,
      driver: sqlite3.Database,
    });
    return {
      resolvers: [
        userResolvers,
        ventaResolvers,
        distribuidorResolvers,
        consignaResolvers,
      ],
      context: { db },
    };
  }
  console.error('Environment variable SQLITE_FILE is required');
}
