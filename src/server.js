/* eslint-disable global-require */
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';

export function stop() {
  process.exit(0);
}

export function start() {
  return Promise.resolve()
    .then(() => {
      switch (process.env.DATA_SOURCE) {
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
                  context: request => ({
                    db,
                    currentUser,
                    request,
                  }),
                })
            )
          );
        }

        case 'JSON': {
          console.log('Start with JSON');
          const resolvers = require('./resolvers/memory').default;
          const { readJson } = require('fs-extra');
          return readJson(process.env.JSON_FILE).then(
            data =>
              new ApolloServer({
                typeDefs: schema,
                resolvers,
                context: request => ({
                  data,
                  currentUser: data.users.ro,
                  request,
                }),
              })
          );
        }
        default:
          console.error('No data source given');
          return null;
      }
    })
    .then(server => {
      const app = express();

      app.use(cors());

      server.applyMiddleware({ app, path: process.env.GRAPHQL });

      app.get('/kill', stop);

      const PORT = process.env.SERVER_PORT || 8000;
      return new Promise(resolve => {
        app.listen({ port: PORT }, () => {
          console.log(
            `Apollo Server on ${process.env.HOST}:${PORT}${process.env.GRAPHQL}`
          );
          resolve();
        });
      });
    });
}
