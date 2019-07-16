import { compareFecha, slice, filterBy } from './utils';

export default {
  Query: {
    venta: (parent, { id }, { data }) => data.ventas[id],
    ventas: (parent, args, { data }) =>
      slice(
        filterBy(Object.values(data.ventas), 'vendedor', args.vendedor).sort(
          compareFecha
        ),
        args
      ),
  },
  Venta: {
    vendedor: (parent, args, { data }) => data.users[parent.vendedor],
  },
};
