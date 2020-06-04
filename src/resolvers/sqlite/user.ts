import type { sqlContext } from '.'
import { User } from '..'
import {
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteById,
} from './utils';
import { sqlite3 } from 'sqlite3';

const TABLE = 'Users';

const safeFields = ['id', 'nombre', 'email'];
export default {
  Query: {
    user: (parent: unused, { id }: { id: ID }, { db }: sqlContext) => getById(TABLE, id, db, safeFields),
    users: (parent: unused, args: Rango, { db }: sqlContext) =>
      getAllLimitOffset(TABLE, args, db, safeFields),
    currentUser: (parent: unused, args: unused, { req }: sqlContext) => req.currentUser,
  },
  Mutation: {
    createUser: (parent: unused, args: User, { db }: sqlContext) =>
      createWithCuid(TABLE, args, db, safeFields),
    updateUser: (parent: unused, args: User, { db }: sqlContext) => {
      return updateById(TABLE, args, db, safeFields);
    },
    deleteUser: (parent: unused, { id }: { id: ID }, { db, permissions }: sqlContext) =>
      // permissions.includes('user:delete')
      //   ? deleteById(TABLE, id, db, safeFields)
      //   : new Error('unauthorized'),
      deleteById(TABLE, id, db, safeFields)
  },
  User: {
    ventas: (parent: User, { offset = 0, limit, last }: Rango, { db }: sqlContext) => {
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
