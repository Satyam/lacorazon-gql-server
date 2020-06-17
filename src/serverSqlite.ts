import { ApolloServer } from 'apollo-server-express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import resolvers from './resolvers/sqlite';

import type { MyRequest, typeDefs } from '.';

export async function serverSqlite(schema: typeDefs): Promise<ApolloServer> {
  console.log('Start with SQLite');
  const sqliteFile = process.env.SQLITE_FILE;
  if (sqliteFile) {
    const db = await open({
      filename: sqliteFile,
      driver: sqlite3.Database,
    });
    return new ApolloServer({
      typeDefs: schema,
      resolvers,
      context: ({ req }) => ({
        db,
        permissions:
          ((<MyRequest>req).user && (<MyRequest>req).user.permissions) || [],
      }),
    });
  } else {
    console.error('Environment variable SQLITE_FILE is required');
    process.exit(1);
  }
}
