import {
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteById,
} from './utils';

import {
  hashPassword,
  checkPassword,
  sendToken,
  invalidateToken,
} from '../../auth';

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
      hashPassword(args.password).then(password =>
        createWithCuid(TABLE, { ...args, password }, db, safeFields)
      ),
    updateUser: (parent, args, { db }) => {
      if ('password' in args) {
        return hashPassword(args.password).then(password =>
          updateById(TABLE, { ...args, password }, db, safeFields)
        );
      }
      return updateById(TABLE, args, db, safeFields);
    },
    deleteUser: (parent, { id }, { db }) =>
      deleteById(TABLE, id, db, safeFields),
    login: (parent, { nombre, password }, { db, res }) =>
      db
        .get('select id, password from Users where nombre = ?', [nombre])
        .then(row =>
          row
            ? checkPassword(row.password, password).then(match =>
                match
                  ? getById(TABLE, row.id, db, safeFields).then(user =>
                      sendToken(user, res)
                    )
                  : invalidateToken(res)
              )
            : invalidateToken(res)
        ),
    logout: (parent, args, { res }) => invalidateToken(res),
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
          .then(data => data.reverse());
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
