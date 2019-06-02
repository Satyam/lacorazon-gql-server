import {
  compareFecha,
  slice,
  getWithId,
  getAllLimitOffset,
  createWithId,
  updateWithId,
  deleteWithId,
} from './utils';

export default {
  Query: {
    user: (parent, { id }, { data }) => getWithId(data.users, id),
    users: (parent, args, { data }) => getAllLimitOffset(data.users, args),
  },
  Mutation: {
    createUser: (parent, args, { data }) => createWithId(data.users, args),
    updateUser: (parent, args, { data }) => updateWithId(data.users, args),
    deleteUser: (parent, { id }, { data }) => deleteWithId(data.users, id),
  },
  User: {
    ventas: (parent, args, { data }) =>
      slice(
        Object.values(data.ventas)
          .filter(venta => venta.vendedor === parent.id)
          .sort(compareFecha),
        args
      ),
  },
};
