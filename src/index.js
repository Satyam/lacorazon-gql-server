import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import * as data from './data.json';

const app = express();

app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    data,
    currentUser: data.users.ro,
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const PORT = process.env.SERVER_PORT || 8000;
app.listen({ port: PORT }, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
});
