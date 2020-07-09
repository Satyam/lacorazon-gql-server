import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import resolvers from './resolvers/sqlite';

import type { Context } from '.';

export async function contextSqlite(): Promise<Context | undefined> {
  console.log('Start with SQLite');
  const sqliteFile = process.env.SQLITE_FILE;
  if (sqliteFile) {
    const db = await open({
      filename: sqliteFile,
      driver: sqlite3.Database,
    });
    return { resolvers, context: { db } };
  }
  console.error('Environment variable SQLITE_FILE is required');
}
