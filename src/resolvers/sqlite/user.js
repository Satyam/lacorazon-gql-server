import {
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteById,
} from './utils';

const TABLE = 'Users';

const safeFields = ['id', 'nombre', 'email'];
export default {
  Query: {
    user: (parent, { id }, { db }) => getById(TABLE, id, db, safeFields),
    users: (parent, args, { db }) =>
      getAllLimitOffset(TABLE, args, db, safeFields),
    currentUser: (parent, args, { req }) => req.currentUser,
  },
  Mutation: {
    createUser: (parent, args, { db }) =>
      createWithCuid(TABLE, args, db, safeFields),
    updateUser: (parent, args, { db }) => {
      return updateById(TABLE, args, db, safeFields);
    },
    deleteUser: (parent, { id }, { db /* , permissions */ }) =>
      // permissions.includes('user:delete')
      /* ? */ deleteById(TABLE, id, db, safeFields),
    // : new Error('unauthorized'),
  },
  User: {
    ventas: (parent, { offset = 0, limit, last }, { db }) => {
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
