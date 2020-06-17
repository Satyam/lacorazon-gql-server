import { ApolloServer } from 'apollo-server-express';
import resolvers from './resolvers/memory';

import type { MyRequest, typeDefs } from '.';
import { JSONData } from './resolvers/memory';

export async function serverJson(schema: typeDefs): Promise<ApolloServer> {
  console.log('Start with JSON');
  const jsonFile = process.env.JSON_FILE;
  if (jsonFile) {
    const fs = await import('fs-extra');
    const data: JSONData = await fs.readJson(jsonFile);
    return new ApolloServer({
      typeDefs: schema,
      resolvers,
      context: ({ req }) => ({
        data,
        permissions:
          ((<MyRequest>req).user && (<MyRequest>req).user.permissions) || [],
      }),
    });
  } else {
    console.error('Environment variable JSON_FILE is required');
    process.exit(1);
  }
}
