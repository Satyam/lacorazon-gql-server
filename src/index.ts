import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import { checkJwt } from './auth0';

import { JSONData } from './resolvers/memory';
// import type { QueryEvent } from '@prisma/client';
type MyRequest = Request & {
  user: {
    permissions: string[];
  };
};

async function getApolloServer(): Promise<ApolloServer | null> {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource) {
    switch (dataSource.toLowerCase()) {
      case 'sqlite': {
        console.log('Start with SQLite');
        const sqliteFile = process.env.SQLITE_FILE;
        if (sqliteFile) {
          const sqlite = await import('sqlite');
          const resolvers = await import('./resolvers/sqlite');
          const sqlite3 = await import('sqlite3');
          const db = await sqlite.open({
            filename: sqliteFile,
            driver: sqlite3.Database,
          });
          return new ApolloServer({
            typeDefs: schema,
            resolvers: resolvers.default,
            context: ({ req }) => ({
              db,
              permissions:
                ((<MyRequest>req).user && (<MyRequest>req).user.permissions) ||
                [],
            }),
          });
        } else {
          console.error('Environment variable SQLITE_FILE is required');
          process.exit(1);
        }
      }
      case 'json':
        console.log('Start with JSON');
        const jsonFile = process.env.JSON_FILE;
        if (jsonFile) {
          const resolvers = await import('./resolvers/memory');
          const fs = await import('fs-extra');
          const data: JSONData = await fs.readJson(jsonFile);
          return new ApolloServer({
            typeDefs: schema,
            resolvers: resolvers.default,
            context: ({ req }) => ({
              data,
              permissions:
                ((<MyRequest>req).user && (<MyRequest>req).user.permissions) ||
                [],
            }),
          });
        } else {
          console.error('Environment variable JSON_FILE is required');
          process.exit(1);
        }
      case 'prisma':
        console.log('Start with Prisma');
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        // prisma.on('query', (e: QueryEvent) => {
        //   console.log(
        //     '***',
        //     e.query.replace(/`db`\./g, '').replace(/`/g, ''),
        //     e.params
        //   );
        // });
        const resolvers = await import('./resolvers/prisma');
        return new ApolloServer({
          typeDefs: schema,
          resolvers: resolvers.default,
          context: ({ req }) => ({
            prisma,
            permissions:
              ((<MyRequest>req).user && (<MyRequest>req).user.permissions) ||
              [],
          }),
        });
      default:
        console.error('No data source given');
        return null;
    }
  } else {
    console.error('Environment variable DATA_SOURCE is required');
    process.exit(1);
  }
}

async function start() {
  const server = await getApolloServer();
  if (server) {
    const app: Express = express();

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
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err.name === 'UnauthorizedError') {
          // console.log('unauthorized');
          next();
        } else console.error(err);
      }
    );

    app.get('/kill', () => process.exit());

    server.applyMiddleware({ app, path: process.env.GRAPHQL });

    const PORT = process.env.SERVER_PORT || 8000;

    app.listen({ port: PORT }, () => {
      console.log(
        `Apollo Server on ${process.env.HOST}:${PORT}${process.env.GRAPHQL}`
      );
    });
  } else {
    console.error('Something bad happend, see previous messages');
    process.exit(1);
  }
}

start();
