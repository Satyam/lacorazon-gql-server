/* eslint-disable global-require */
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';

Promise.resolve()
  .then(() => {
    switch (process.env.DATA) {
      case 'SQLite': {
        console.log('Start with SQLite');
        const sqlite = require('sqlite');
        const resolvers = require('./resolvers/sqlite').default;
        return sqlite.open(process.env.SQLITE_FILE).then(db =>
          db.get('Select * from Users where id=0').then(
            currentUser =>
              new ApolloServer({
                typeDefs: schema,
                resolvers,
                context: {
                  db,
                  currentUser,
                },
              })
          )
        );
      }

      case 'JSON': {
        console.log('Start with JSON');
        const resolvers = require('./resolvers/memory').default;
        const data = require('./data.json');
        return new ApolloServer({
          typeDefs: schema,
          resolvers,
          context: {
            data,
            currentUser: data.users.ro,
          },
        });
      }
      default:
        console.error('No data source given');
        return null;
    }
  })
  .then(server => {
    const app = express();

    app.use(cors());

    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.SERVER_PORT || 8000;
    app.listen({ port: PORT }, () => {
      console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
    });
  });
