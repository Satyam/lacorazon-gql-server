export default {
  Query: {
    venta: (parent, { id }, { db }) =>
      db.get('select * from Ventas where id = ?', [id]),
    ventas: (parent, { offset = 0, limit, last, vendedor }, { db }) => {
      if (last) {
        return db
          .all(
            vendedor
              ? 'select * from Ventas where vendedor = $vendedor order by fecha desc, id desc limit $last'
              : 'select * from Ventas order by fecha desc, id desc limit $last',
            {
              $last: last,
              $vendedor: vendedor,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          vendedor
            ? 'select * from Ventas where vendedor = $vendedor order by fecha, id limit $limit offset $offset'
            : 'select * from Ventas order by fecha, id limit $limit offset $offset',
          {
            $limit: limit,
            $offset: offset,
            $vendedor: vendedor,
          }
        );
      }
      return db.all(
        vendedor
          ? 'select * from Ventas where vendedor = $vendedor order by fecha, id'
          : 'select * from Ventas  order by fecha, id',
        {
          $vendedor: vendedor,
        }
      );
    },
  },
  Venta: {
    vendedor: (parent, args, { db }) =>
      db.get('select * from Users where id = ?', [parent.vendedor]),
  },
};
