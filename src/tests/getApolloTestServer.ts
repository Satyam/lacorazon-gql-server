import { ApolloServer } from 'apollo-server';
import schema from '../schema';

export default async function getApolloTestServer(): Promise<ApolloServer> {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource) {
    const { getContext } = await import(
      `../resolvers/${dataSource.toLowerCase()}`
    );
    const ctx = await getContext();

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
