import type { Venta, User } from '..';
import { jsonContext } from '.';

import {
  compareFecha,
  slice,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

export default {
  Query: {
    venta: (
      _: unused,
      { id }: { id: ID },
      { data }: jsonContext
    ): Partial<Venta> => data.ventas[id],
    ventas: (
      _: unused,
      { idVendedor, ...rango }: Rango & { idVendedor: ID },
      { data }: jsonContext
    ): Array<Partial<Venta>> =>
      slice(
        Object.values(data.ventas)
          .filter((fila) =>
            idVendedor ? fila.idVendedor === idVendedor : true
          )
          .sort(compareFecha),
        rango
      ),
  },
  Mutation: {
    createVenta: (
      _: unused,
      venta: Venta,
      { data }: jsonContext
    ): Partial<Venta> => createWithCuid(data.ventas, venta),
    updateVenta: (
      _: unused,
      venta: Venta,
      { data }: jsonContext
    ): Partial<Venta> => updateById(data.ventas, venta),
    deleteVenta: (
      _: unused,
      { id }: { id: ID },
      { data }: jsonContext
    ): Partial<Venta> => deleteWithId(data.ventas, id),
  },
  Venta: {
    vendedor: (
      venta: Venta,
      _: unused,
      { data }: jsonContext
    ): Partial<User> | null =>
      venta.idVendedor ? data.users[venta.idVendedor] : null,
  },
};
