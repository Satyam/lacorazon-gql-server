import {
  compareFecha,
  slice,
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

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
      createWithCuid(data.users, args, safeFields),
    updateUser: (parent, args, { data }) =>
      updateById(data.users, args, safeFields),
    deleteUser: (parent, { id }, { data }) =>
      deleteWithId(data.users, id, safeFields),
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
