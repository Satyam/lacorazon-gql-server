export default {
  Query: {
    consigna: (parent, { id }, { db }) =>
      db.get('select * from Consigna where id = ?', [id]),
    consignas: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Consigna order by fecha desc, id desc limit $last',
            {
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Consigna order by fecha, id limit $limit offset $offset',
          {
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all('select * from Consigna  order by fecha, id');
    },
  },
  Consigna: {
    vendedor: (parent, args, { db }) =>
      db.get('select * from Users where id = ?', [parent.idVendedor]),
    distribuidor: (parent, args, { db }) =>
      db.get('select * from Distribuidores where id = ?', [
        parent.idDistribuidor,
      ]),
  },
};
