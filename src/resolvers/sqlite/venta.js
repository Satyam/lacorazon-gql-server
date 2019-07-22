import { createWithAutoId, updateById, deleteById } from './utils';

const TABLE = 'Ventas';

export default {
  Query: {
    venta: (parent, { id }, { db }) =>
      db.get('select * from Ventas where id = ?', [id]),
    ventas: (parent, { offset = 0, limit, last, idVendedor }, { db }) => {
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
          .then(data => data.reverse());
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
    createVenta: (parent, args, { db }) =>
      createWithAutoId(TABLE, { ...args, iva: args.iva ? 1 : 0 }, db),
    updateVenta: (parent, args, { db }) =>
      updateById(TABLE, { ...args, iva: args.iva ? 1 : 0 }, db),
    deleteVenta: (parent, { id }, { db }) => deleteById(TABLE, id, db),
  },
  Venta: {
    vendedor: (parent, args, { db }) =>
      db.get('select * from Users where id = ?', [parent.idVendedor]),
  },
};
