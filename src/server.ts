/* eslint-disable global-require */
import express, { Request, NextFunction } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import { checkJwt } from './auth0';

import { JSONData } from './resolvers/memory';
export function stop() {
  process.exit(0);
}

declare global {
  namespace Express {
    interface Request {
      user: {
        permissions: string[];
      };
    }
  }
}
export function start() {
  return Promise.resolve()
    .then(() => {
      const dataSource = process.env.DATA_SOURCE;
      if (dataSource) {
        switch (dataSource.toLowerCase()) {
          case 'sqlite': {
            console.log('Start with SQLite');
            const sqliteFile = process.env.SQLITE_FILE;
            if (sqliteFile) {
              return import('sqlite').then((sqlite) =>
                import('./resolvers/sqlite').then((resolvers) =>
                  import('sqlite3').then((sqlite3) =>
                    sqlite
                      .open({
                        filename: sqliteFile,
                        driver: sqlite3.Database,
                      })
                      .then(
                        (db) =>
                          new ApolloServer({
                            typeDefs: schema,
                            resolvers: resolvers.default,
                            context: ({ req }) => ({
                              db,
                              // @ts-ignore
                              permissions:
                                (req.user && req.user.permissions) || [],
                            }),
                          })
                      )
                  )
                )
              );
            } else {
              console.error('Environment variable SQLITE_FILE is required');
              process.exit(1);
            }
          }

          case 'json':
            console.log('Start with JSON');
            const jsonFile = process.env.JSON_FILE;
            if (jsonFile) {
              return import('./resolvers/memory').then((resolvers) =>
                import('fs-extra').then((fs) =>
                  fs.readJson(jsonFile).then(
                    (data: JSONData) =>
                      new ApolloServer({
                        typeDefs: schema,
                        resolvers: resolvers.default,
                        context: ({ req }) => ({
                          data,
                          // @ts-ignore
                          permissions: (req.user && req.user.permissions) || [],
                        }),
                      })
                  )
                )
              );
            } else {
              console.error('Environment variable JSON_FILE is required');
              process.exit(1);
            }

          default:
            console.error('No data source given');
            return null;
        }
      } else {
        console.error('Environment variable DATA_SOURCE is required');
        process.exit(1);
      }
    })
    .then((server) => {
      if (server) {
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
        const errorHandler: express.ErrorRequestHandler = (
          err,
          req,
          res,
          next
        ) => {
          if (err.name === 'UnauthorizedError') {
            // console.log('unauthorized');
            next();
          } else console.error(err);
        };
        app.use(
          process.env.GRAPHQL || '/graphql',
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
          errorHandler
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
      } else {
        console.error('Something bad happend, see previous messages');
        process.exit(1);
      }
    });
}
