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
    user: (_: unused, { id }: { id: ID }, { data }: jsonContext) => getById(data.users, id, safeFields),
    users: (_: unused, rango: Rango, { data }: jsonContext) =>
      getAllLimitOffset(data.users, rango, safeFields),
    currentUser: (_: unused, _1: unused, { req }: jsonContext) => req.currentUser,
  },
  Mutation: {
    createUser: (_: unused, user: User, { data }: jsonContext) =>
      createWithCuid(data.users, user, safeFields),
    updateUser: (_: unused, user: User, { data }: jsonContext) =>
      updateById(data.users, user, safeFields),
    deleteUser: (_: unused, { id }: { id: ID }, { data }: jsonContext) =>
      deleteWithId(data.users, id, safeFields),
  },
  User: {
    ventas: (parent: User, rango: Rango, { data }: jsonContext) =>
      slice(
        Object.values(data.ventas)
          .filter((venta) => venta.idVendedor === parent.id)
          .sort(compareFecha),
        rango
      ),
  },
};
