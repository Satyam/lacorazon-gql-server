import type { sqlContext } from '.'

export default {
  Query: {
    consigna: (parent: unused, { id }: { id: ID }, { db }: sqlContext) =>
      db.get('select * from Consigna where id = ?', [id]),
    consignas: (parent: unused, { offset = 0, limit, last }: Rango, { db }: sqlContext) => {
      if (last) {
        return db
          .all(
            'select * from Consigna order by fecha desc, id desc limit $last',
            {
              $last: last,
            }
          )
          .then((data) => data.reverse());
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
    vendedor: (parent: unused, args: unused, { db }: sqlContext) =>
      db.get('select * from Users where id = ?', [parent.idVendedor]),
    distribuidor: (parent: unused, args: unused, { db }: sqlContext) =>
      db.get('select * from Distribuidores where id = ?', [
        parent.idDistribuidor,
      ]),
  },
};
