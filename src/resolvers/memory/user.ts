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
    user: (parent, { id }: { id: ID }, { data }: { data: JSONData }) => getById(data.users, id, safeFields),
    users: (parent, args: Rango, { data }: { data: JSONData }) =>
      getAllLimitOffset(data.users, args, safeFields),
    currentUser: (parent, args, { req }) => req.currentUser,
  },
  Mutation: {
    createUser: (parent, args: User, { data }: { data: JSONData }) =>
      createWithCuid(data.users, args, safeFields),
    updateUser: (parent, args: User, { data }: { data: JSONData }) =>
      updateById(data.users, args, safeFields),
    deleteUser: (parent, { id }: { id: ID }, { data }) =>
      deleteWithId(data.users, id, safeFields),
  },
  User: {
    ventas: (parent: User, args, { data }: { data: JSONData }) =>
      slice(
        Object.values(data.ventas)
          .filter((venta) => venta.idVendedor === parent.id)
          .sort(compareFecha),
        args
      ),
  },
};
