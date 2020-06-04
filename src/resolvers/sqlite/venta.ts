import type { sqlContext } from '.'
import { Venta } from '..'
import { createWithAutoId, updateById, deleteById } from './utils';

const TABLE = 'Ventas';

export default {
  Query: {
    venta: (parent: unused, { id }: { id: ID }, { db }: sqlContext) =>
      db.get('select * from Ventas where id = ?', [id]),
    ventas: (parent: unused, { offset = 0, limit, last, idVendedor }: Rango & { idVendedor: ID }, { db }: sqlContext) => {
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
    createVenta: (parent: unused, args: Venta, { db }: sqlContext) =>
      createWithAutoId(TABLE, args, db),
    updateVenta: (parent: unused, args: Venta, { db }: sqlContext) =>
      updateById(TABLE, args, db),
    deleteVenta: (parent: unused, { id }: { id: ID }, { db }: sqlContext) => deleteById(TABLE, id, db),
  },
  Venta: {
    vendedor: (parent: Venta, args: unused, { db }: sqlContext) =>
      db.get('select * from Users where id = ?', [parent.idVendedor]),
  },
};
