import { compareFecha } from './utils';

export default {
  Query: {
    user: (parent, { id }, { data }) => data.users[id],
    users: (parent, args, { data }) => Object.values(data.users),
  },
  User: {
    ventas: (
      parent,
      { offset = 0, limit = Number.MAX_SAFE_INTEGER, last },
      { data }
    ) => {
      const vs = Object.values(data.ventas)
        .filter(venta => venta.vendedor === parent.id)
        .sort(compareFecha);
      return last ? vs.slice(-last) : vs.slice(offset, offset + limit);
    },
  },
};
