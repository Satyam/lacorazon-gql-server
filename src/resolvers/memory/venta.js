import {
  compareFecha,
  slice,
  filterBy,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

export default {
  Query: {
    venta: (parent, { id }, { data }) => data.ventas[id],
    ventas: (parent, args, { data }) =>
      slice(
        filterBy(
          Object.values(data.ventas),
          'idVendedor',
          args.idVendedor
        ).sort(compareFecha),
        args
      ),
  },
  Mutation: {
    createVenta: (parent, args, { data }) => createWithCuid(data.ventas, args),
    updateVenta: (parent, args, { data }) => updateById(data.ventas, args),
    deleteVenta: (parent, { id }, { data }) => deleteWithId(data.ventas, id),
  },
  Venta: {
    vendedor: (parent, args, { data }) => data.users[parent.idVendedor],
  },
};
