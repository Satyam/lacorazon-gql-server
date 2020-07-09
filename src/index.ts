import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import schema from './schema';
import { checkJwt } from './auth0';

export type MyRequest = Request & {
  user: {
    permissions: string[];
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Context = { resolvers: any; context: any };

async function getApolloServer(): Promise<ApolloServer> {
  const dataSource = process.env.DATA_SOURCE;
  let ctx: Context | undefined;
  if (dataSource) {
    switch (dataSource.toLowerCase()) {
      case 'sqlite':
        const { contextSqlite } = await import('./serverSqlite');
        ctx = await contextSqlite();
      case 'json':
        const { contextJson } = await import('./serverJson');
        ctx = await contextJson();
      case 'prisma':
        const { contextPrisma } = await import('./serverPrisma');
        ctx = await contextPrisma();
      default:
        console.error('No data source given');
    }
    if (ctx) {
      const { resolvers, context } = ctx;
      return new ApolloServer({
        typeDefs: schema,
        resolvers,
        context: ({ req }) => ({
          ...context,
          permissions:
            ((<MyRequest>req).user && (<MyRequest>req).user.permissions) || [],
        }),
      });
    }
    process.exit(1);
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
