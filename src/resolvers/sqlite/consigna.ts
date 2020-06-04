import type { sqlContext } from '.'
import { Consignacion } from '..'
export default {
  Query: {
    consigna: (_: unused, { id }: { id: ID }, { db }: sqlContext) =>
      db.get('select * from Consigna where id = ?', [id]),
    consignas: (_: unused, { offset = 0, limit, last }: Rango, { db }: sqlContext) => {
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
    vendedor: (consignacion: Consignacion, _: unused, { db }: sqlContext) =>
      db.get('select * from Users where id = ?', [consignacion.idVendedor]),
    distribuidor: (consignacion: Consignacion, _: unused, { db }: sqlContext) =>
      db.get('select * from Distribuidores where id = ?', [
        consignacion.idDistribuidor,
      ]),
  },
};
