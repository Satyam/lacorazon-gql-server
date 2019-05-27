export default {
  Query: {
    venta: (parent, { id }, { db }) =>
      db.get('select * from Ventas where id = ?', [id]),
    ventas: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all('select * from Ventas order by fecha desc limit $last', {
            $last: last,
          })
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Ventas order by fecha limit $limit offset $offset',
          {
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all('select * from Ventas  order by fecha');
    },
  },
  Venta: {
    vendedor: (parent, args, { db }) =>
      db.get('select * from Users where id = ?', [parent.vendedor]),
  },
};
