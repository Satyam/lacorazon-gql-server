import { ApolloServer } from 'apollo-server';
import schema from '../schema';
import { JSONData } from '../resolvers/memory';

export default async function getApolloTestServer(): Promise<ApolloServer> {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource) {
    switch (dataSource.toLowerCase()) {
      case 'sqlite':
        {
          console.log('Start with SQLite');
          const sqliteFile = process.env.SQLITE_FILE;
          if (sqliteFile) {
            const sqlite = await import('sqlite');
            const resolvers = await import('../resolvers/sqlite');
            const sqlite3 = await import('sqlite3');
            const db = await sqlite.open({
              filename: sqliteFile,
              driver: sqlite3.Database,
            });
            return new ApolloServer({
              typeDefs: schema,
              resolvers: resolvers.default,
              context: () => ({
                db,
              }),
            });
          } else {
            return Promise.reject(
              'Environment variable SQLITE_FILE is required'
            );
          }
        }
        break;
      case 'json':
        console.log('Start with JSON');
        const jsonFile = process.env.JSON_FILE;
        if (jsonFile) {
          const resolvers = await import('../resolvers/memory');
          const fs = await import('fs-extra');
          const data: JSONData = await fs.readJson(jsonFile);
          return new ApolloServer({
            typeDefs: schema,
            resolvers: resolvers.default,
            context: () => ({
              data,
            }),
          });
        } else {
          return Promise.reject('Environment variable JSON_FILE is required');
        }
        break;
      default:
        return Promise.reject('No data source given');
    }
  } else {
    return Promise.reject('Environment variable DATA_SOURCE is required');
  }
}
