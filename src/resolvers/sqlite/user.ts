import type { sqlContext } from '.';
import { User } from '..';
import {
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteById,
} from './utils';

const TABLE = 'Users';

const safeFields: Array<Partial<keyof User>> = ['id', 'nombre', 'email'];
export default {
  Query: {
    user: (_: unused, { id }: { id: ID }, { db }: sqlContext) =>
      getById(TABLE, id, db, safeFields),
    users: (_: unused, rango: Rango, { db }: sqlContext) =>
      getAllLimitOffset(TABLE, rango, db, safeFields),
    currentUser: (_: unused, _1: unused, { req }: sqlContext) =>
      req.currentUser,
  },
  Mutation: {
    createUser: (_: unused, user: User, { db }: sqlContext) =>
      createWithCuid(TABLE, user, db, safeFields),
    updateUser: (_: unused, user: User, { db }: sqlContext) => {
      return updateById(TABLE, user, db, safeFields);
    },
    deleteUser: (
      _: unused,
      { id }: { id: ID },
      { db, permissions }: sqlContext
    ) =>
      // permissions.includes('user:delete')
      //   ? deleteById(TABLE, id, db, safeFields)
      //   : new Error('unauthorized'),
      deleteById(TABLE, id, db, safeFields),
  },
  User: {
    ventas: (
      parent: User,
      { offset = 0, limit, last }: Rango,
      { db }: sqlContext
    ) => {
      if (last) {
        return db
          .all(
            'select * from Ventas where idVendedor = $idVendedor order by fecha desc, id desc limit $last',
            {
              $idVendedor: parent.id,
              $last: last,
            }
          )
          .then((data) => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Ventas where idVendedor = $idVendedor order by fecha, id limit $limit offset $offset',
          {
            $idVendedor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Ventas where idVendedor = $idVendedor order by fecha, id',
        {
          $idVendedor: parent.id,
        }
      );
    },
  },
};
