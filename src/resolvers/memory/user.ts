import type { User } from '..'
import { jsonContext } from '.'

import {
  compareFecha,
  slice,
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

const safeFields: Array<keyof Omit<User, 'password'>> = ['id', 'nombre', 'email'];

export default {
  Query: {
    user: (parent: unused, { id }: { id: ID }, { data }: jsonContext) => getById(data.users, id, safeFields),
    users: (parent: unused, rango: Rango, { data }: jsonContext) =>
      getAllLimitOffset(data.users, rango, safeFields),
    currentUser: (parent: unused, args: unused, { req }: jsonContext) => req.currentUser,
  },
  Mutation: {
    createUser: (parent: unused, user: User, { data }: jsonContext) =>
      createWithCuid(data.users, user, safeFields),
    updateUser: (parent: unused, user: User, { data }: jsonContext) =>
      updateById(data.users, user, safeFields),
    deleteUser: (parent: unused, { id }: { id: ID }, { data }: jsonContext) =>
      deleteWithId(data.users, id, safeFields),
  },
  User: {
    ventas: (parent: User, args: unused, { data }: jsonContext) =>
      slice(
        Object.values(data.ventas)
          .filter((venta) => venta.idVendedor === parent.id)
          .sort(compareFecha),
        args
      ),
  },
};
