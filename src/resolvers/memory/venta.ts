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
    venta: (parent, { id }: { id: ID }, { data }: { data: JSONData }) => data.ventas[id],
    ventas: (parent, args: Rango & { idVendedor: ID }, { data }: { data: JSONData }) =>
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
    createVenta: (parent, args: Venta, { data }: { data: JSONData }) => createWithCuid(data.ventas, args),
    updateVenta: (parent, args: Venta, { data }: { data: JSONData }) => updateById(data.ventas, args),
    deleteVenta: (parent, { id }: { id: ID }, { data }: { data: JSONData }) => deleteWithId(data.ventas, id),
  },
  Venta: {
    vendedor: (parent, args, { data }: { data: JSONData }) => data.users[parent.idVendedor],
  },
};
