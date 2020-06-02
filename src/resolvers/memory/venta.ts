import type { Venta } from '..'
import { jsonContext } from '.'

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
    venta: (parent: unused, { id }: { id: ID }, { data }: jsonContext) => data.ventas[id],
    ventas: (parent: unused, args: Rango & { idVendedor: ID }, { data }: jsonContext) =>
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
    createVenta: (parent: unused, args: Venta, { data }: jsonContext) => createWithCuid(data.ventas, args),
    updateVenta: (parent: unused, args: Venta, { data }: jsonContext) => updateById(data.ventas, args),
    deleteVenta: (parent: unused, { id }: { id: ID }, { data }: jsonContext) => deleteWithId(data.ventas, id),
  },
  Venta: {
    vendedor: (parent: unused, args: unused, { data }: jsonContext) => data.users[parent.idVendedor],
  },
};
