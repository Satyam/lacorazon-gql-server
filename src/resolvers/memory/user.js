import {
  compareFecha,
  slice,
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

import {
  hashPassword,
  checkPassword,
  sendToken,
  invalidateToken,
} from '../../auth0';

const safeFields = ['id', 'nombre', 'email'];

export default {
  Query: {
    user: (parent, { id }, { data }) => getById(data.users, id, safeFields),
    users: (parent, args, { data }) =>
      getAllLimitOffset(data.users, args, safeFields),
    currentUser: (parent, args, { req }) => req.currentUser,
  },
  Mutation: {
    createUser: (parent, args, { data }) =>
      hashPassword(args.password).then((password) =>
        createWithCuid(data.users, { ...args, password }, safeFields)
      ),
    updateUser: (parent, args, { data }) => {
      if ('password' in args) {
        return hashPassword(args.password).then((password) =>
          updateById(data.users, { ...args, password }, safeFields)
        );
      }
      return updateById(data.users, args, safeFields);
    },
    deleteUser: (parent, { id }, { data }) =>
      deleteWithId(data.users, id, safeFields),
    login: (parent, { nombre, password }, { data, res }) => {
      const row = Object.values(data.users).find((u) => u.nombre === nombre);
      return row
        ? checkPassword(row.password, password).then((match) =>
          match
            ? sendToken(getById(data.users, row.id, safeFields), res)
            : invalidateToken(res)
        )
        : invalidateToken(res);
    },
    logout: (parent, args, { res }) => {
      return invalidateToken(res);
    },
  },
  User: {
    ventas: (parent, args, { data }) =>
      slice(
        Object.values(data.ventas)
          .filter((venta) => venta.idVendedor === parent.id)
          .sort(compareFecha),
        args
      ),
  },
};
