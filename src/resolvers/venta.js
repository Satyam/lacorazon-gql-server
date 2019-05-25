import { compareFecha } from './utils';

export default {
  Query: {
    venta: (parent, { id }, { data }) => data.ventas[id],
    ventas: (
      parent,
      { offset = 0, limit = Number.MAX_SAFE_INTEGER, last },
      { data }
    ) => {
      const vs = Object.values(data.ventas).sort(compareFecha);
      return last ? vs.slice(-last) : vs.slice(offset, offset + limit);
    },
  },
  Venta: {
    vendedor: (parent, args, { data }) => data.users[parent.vendedor],
  },
};
