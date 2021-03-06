import type { sqlContext } from '.';
import { Venta, User } from '..';
import { createWithAutoId, updateById, deleteById } from './utils';

const TABLE = 'Ventas';

export default {
  Query: {
    venta: (
      _: unused,
      { id }: { id: ID },
      { db }: sqlContext
    ): Promise<Venta | undefined> =>
      db.get('select * from Ventas where id = ?', [id]),
    ventas: (
      _: unused,
      { offset = 0, limit, last, idVendedor }: Rango & { idVendedor: ID },
      { db }: sqlContext
    ): Promise<Venta[] | undefined> => {
      if (last) {
        return db
          .all(
            idVendedor
              ? 'select * from Ventas where idVendedor = $idVendedor order by fecha desc, id desc limit $last'
              : 'select * from Ventas order by fecha desc, id desc limit $last',
            {
              $last: last,
              $idVendedor: idVendedor,
            }
          )
          .then((data) => data.reverse());
      }
      if (limit) {
        return db.all(
          idVendedor
            ? 'select * from Ventas where idVendedor = $idVendedor order by fecha, id limit $limit offset $offset'
            : 'select * from Ventas order by fecha, id limit $limit offset $offset',
          {
            $limit: limit,
            $offset: offset,
            $idVendedor: idVendedor,
          }
        );
      }
      return db.all(
        idVendedor
          ? 'select * from Ventas where idVendedor = $idVendedor order by fecha, id'
          : 'select * from Ventas  order by fecha, id',
        {
          $idVendedor: idVendedor,
        }
      );
    },
  },
  Mutation: {
    createVenta: (
      _: unused,
      venta: Venta,
      { db }: sqlContext
    ): Promise<Venta | undefined> => createWithAutoId<Venta>(TABLE, venta, db),
    updateVenta: (
      _: unused,
      venta: Venta,
      { db }: sqlContext
    ): Promise<Venta | undefined> => updateById<Venta>(TABLE, venta, db),
    deleteVenta: (
      _: unused,
      { id }: { id: ID },
      { db }: sqlContext
    ): Promise<Venta | undefined> => deleteById<Venta>(TABLE, id, db),
  },
  Venta: {
    vendedor: (
      parent: Venta,
      _: unused,
      { db }: sqlContext
    ): Promise<User | undefined> =>
      db.get('select * from Users where id = ?', [parent.idVendedor]),
  },
};
