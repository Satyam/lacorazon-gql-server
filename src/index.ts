import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import schema from './schema';
import { checkJwt } from './auth0';

export type typeDefs =
  | DocumentNode
  | Array<DocumentNode>
  | string
  | Array<string>
  | undefined;

export type MyRequest = Request & {
  user: {
    permissions: string[];
  };
};

async function getApolloServer(): Promise<ApolloServer | null> {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource) {
    switch (dataSource.toLowerCase()) {
      case 'sqlite':
        const { serverSqlite } = await import('./serverSqlite');
        return await serverSqlite(schema);
      case 'json':
        const { serverJson } = await import('./serverJson');
        return await serverJson(schema);
      case 'prisma':
        const { serverPrisma } = await import('./serverPrisma');
        return await serverPrisma(schema);
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
