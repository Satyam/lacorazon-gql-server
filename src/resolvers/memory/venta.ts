import type { Venta } from '..'
import { jsonContext } from '.'

import {
  compareFecha,
  slice,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

export default {
  Query: {
    venta: (parent: unused, { id }: { id: ID }, { data }: jsonContext) => data.ventas[id],
    ventas: (parent: unused, criterio: Rango & { idVendedor: ID }, { data }: jsonContext) =>
      slice(
        Object.values(data.ventas).filter(fila => fila.idVendedor == criterio.idVendedor)
          .sort(compareFecha),
        criterio
      ).filter((fila: Venta) => fila.idVendedor === criterio.idVendedor),
  },
  Mutation: {
    createVenta: (parent: unused, venta: Venta, { data }: jsonContext) => createWithCuid(data.ventas, venta),
    updateVenta: (parent: unused, venta: Venta, { data }: jsonContext) => updateById(data.ventas, venta),
    deleteVenta: (parent: unused, { id }: { id: ID }, { data }: jsonContext) => deleteWithId(data.ventas, id),
  },
  Venta: {
    vendedor: (parent: unused, args: unused, { data }: jsonContext) => data.users[parent.idVendedor],
  },
};
