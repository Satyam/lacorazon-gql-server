import cuid from 'cuid';
import { compareFecha, compareStringField, slice } from './utils';

export default {
  Query: {
    user: (parent, { id }, { data }) => data.users[id],
    users: (parent, args, { data }) =>
      Object.values(data.users).sort(compareStringField('nombre')),
  },
  Mutation: {
    createUser: (parent, { nombre, email }, { data }) => {
      const id = cuid();
      if (id in data.users) {
        throw new Error(`Primary key id clash`);
      }
      if (Object.values(data.users).find(u => u.nombre === nombre)) {
        throw new Error(`Duplicate nombre ${nombre} found`);
      }
      const u = {
        id,
        nombre,
        email,
      };
      // eslint-disable-next-line no-param-reassign
      data.users[id] = u;
      return u;
    },
    updateUser: (parent, { id, nombre, email }, { data }) => {
      const u = data.users[id];

      if (typeof u === 'undefined') {
        throw new Error(`User ${id} not found`);
      }
      if (typeof nombre !== 'undefined') u.nombre = nombre;
      if (typeof email !== 'undefined') u.email = email;
      return u;
    },
    deleteUser: (parent, { id }, { data }) => {
      const u = data.users[id];

      if (typeof u === 'undefined') {
        throw new Error(`User ${id} not found`);
      }
      // eslint-disable-next-line no-param-reassign
      delete data.users[id];
      return u;
    },
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
