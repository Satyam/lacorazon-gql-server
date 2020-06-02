import userResolvers from './user';
import ventaResolvers from './venta';
import distribuidorResolvers from './distribuidor';
import consignaResolvers from './consigna';
import type { Database } from 'sqlite'

export type sqlContext = {
  req: Request & {
    currentUser: string,
  },
  res: Response,
  db: Database,
  permissions: string[]
}

export default [
  userResolvers,
  ventaResolvers,
  distribuidorResolvers,
  consignaResolvers,
];
