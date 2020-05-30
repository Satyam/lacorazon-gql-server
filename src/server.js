/* eslint-disable global-require */
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import { checkJwt } from './auth0';

export function stop() {
  process.exit(0);
}

export function start() {
  return Promise.resolve()
    .then(() => {
      switch (process.env.DATA_SOURCE.toLowerCase()) {
        case 'sqlite': {
          console.log('Start with SQLite');
          const sqlite = require('sqlite');
          const resolvers = require('./resolvers/sqlite').default;
          return sqlite
            .open({
              filename: process.env.SQLITE_FILE,
              driver: require('sqlite3').Database,
            })
            .then(
              (db) =>
                new ApolloServer({
                  typeDefs: schema,
                  resolvers,
                  context: ({ req }) => ({
                    db,
                    permissions: (req.user && req.user.permissions) || [],
                  }),
                })
            );
        }

        case 'json': {
          console.log('Start with JSON');
          const resolvers = require('./resolvers/memory').default;
          const { readJson } = require('fs-extra');
          return readJson(process.env.JSON_FILE).then(
            (data) =>
              new ApolloServer({
                typeDefs: schema,
                resolvers,
                context: ({ req }) => ({
                  data,
                  permissions: (req.user && req.user.permissions) || [],
                }),
              })
          );
        }
        default:
          console.error('No data source given');
          return null;
      }
    })
    .then((server) => {
      const app = express();
      // app.use((req, res, next) => {
      //   res.header('Access-Control-Allow-Origin', '*');
      //   res.header(
      //     'Access-Control-Allow-Headers',
      //     'Origin, X-Requested-With, Content-Type, Accept'
      //   );
      //   next();
      // });
      app.use(
        cors()
        //   {
        //   origin: '*',
        //   credentials: true, // <-- REQUIRED backend setting
        //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        //   preflightContinue: false,
        //   optionsSuccessStatus: 204,
        // }
      );
      app.use(
        process.env.GRAPHQL,
        // (req, res, next) => {
        //   if (
        //     req.headers.authorization &&
        //     req.headers.authorization.split(' ')[0] === 'Bearer'
        //   ) {
        //     console.log(req.headers.authorization.split(' ')[1]);
        //   }
        //   next();
        // },
        checkJwt,
        (err, req, res, next) => {
          if (err.name === 'UnauthorizedError') {
            console.log('unauthorized');
            next();
          } else console.error(err);
        }
      );

      server.applyMiddleware({ app, path: process.env.GRAPHQL });

      app.get('/kill', stop);

      const PORT = process.env.SERVER_PORT || 8000;
      return new Promise((resolve) => {
        app.listen({ port: PORT }, () => {
          console.log(
            `Apollo Server on ${process.env.HOST}:${PORT}${process.env.GRAPHQL}`
          );
          resolve();
        });
      });
    });
}
