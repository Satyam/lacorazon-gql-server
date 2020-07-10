import { ApolloServer } from 'apollo-server';
import schema from '../schema';

import type { Context } from '..';

export default async function getApolloTestServer(): Promise<ApolloServer> {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource) {
    let ctx: Context | undefined;
    switch (dataSource.toLowerCase()) {
      case 'sqlite':
        const { contextSqlite } = await import('../serverSqlite');
        ctx = await contextSqlite();
        break;
      case 'json':
        const { contextJson } = await import('../serverJson');
        ctx = await contextJson();
        break;
      case 'prisma':
        const { contextPrisma } = await import('../serverPrisma');
        ctx = await contextPrisma();
        break;
      default:
        console.error('No data source given');
        break;
    }
    if (ctx) {
      return new ApolloServer({
        typeDefs: schema,
        ...ctx,
      });
    }
    process.exit(1);
  } else {
    console.error('Environment variable DATA_SOURCE is required');
    process.exit(1);
  }
}
