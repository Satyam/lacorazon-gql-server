import { ApolloServer } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import resolvers from './resolvers/prisma';

// import type { QueryEvent } from '@prisma/client';

import type { MyRequest, typeDefs } from '.';

export async function serverPrisma(schema: typeDefs): Promise<ApolloServer> {
  console.log('Start with Prisma');
  const prisma = new PrismaClient();
  // prisma.on('query', (e: QueryEvent) => {
  //   console.log(
  //     '***',
  //     e.query.replace(/`db`\./g, '').replace(/`/g, ''),
  //     e.params
  //   );
  // });
  process.on('SIGTERM', () => {
    // I haven't seen it called.
    // It was meant to avoid the error message on test end.
    console.log('*** disconnecting ***');
    prisma.disconnect();
  });
  return new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: ({ req }) => ({
      prisma,
      permissions:
        ((<MyRequest>req).user && (<MyRequest>req).user.permissions) || [],
    }),
  });
}
