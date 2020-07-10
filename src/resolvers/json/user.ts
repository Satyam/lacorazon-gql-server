import type { User, Venta } from '..';
import { jsonContext } from '.';

import {
  compareFecha,
  slice,
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

const safeFields: Array<Partial<keyof User>> = ['id', 'nombre', 'email'];

export default {
  Query: {
    user: (
      _: unused,
      { id }: { id: ID },
      { data }: jsonContext
    ): Partial<User> => getById<User>(data.users, id, safeFields),
    users: (
      _: unused,
      rango: Rango,
      { data }: jsonContext
    ): Array<Partial<User>> =>
      getAllLimitOffset<User>(data.users, rango, safeFields),
    currentUser: (_: unused, _1: unused, { req }: jsonContext): string =>
      req.currentUser,
  },
  Mutation: {
    createUser: (_: unused, user: User, { data }: jsonContext): Partial<User> =>
      createWithCuid<User>(data.users, user, safeFields),
    updateUser: (_: unused, user: User, { data }: jsonContext): Partial<User> =>
      updateById<User>(data.users, user, safeFields),
    deleteUser: (
      _: unused,
      { id }: { id: ID },
      { data }: jsonContext
    ): Partial<User> => deleteWithId<User>(data.users, id, safeFields),
  },
  User: {
    ventas: (parent: User, rango: Rango, { data }: jsonContext): Venta[] =>
      slice(
        Object.values(data.ventas)
          .filter((venta) => venta.idVendedor === parent.id)
          .sort(compareFecha),
        rango
      ),
  },
};
