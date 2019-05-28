import { compareFecha, slice, compareStringField } from './utils';

export default {
  Query: {
    venta: (parent, { id }, { data }) => data.ventas[id],
    ventas: (parent, args, { data }) =>
      slice(
        Object.values(data.ventas)
          .sort(compareStringField('id'))
          .sort(compareFecha),
        args
      ),
  },
  Venta: {
    vendedor: (parent, args, { data }) => data.users[parent.vendedor],
  },
};
