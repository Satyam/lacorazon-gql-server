import {
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteById,
} from './utils';

const TABLE = 'Distribuidores';

export default {
  Query: {
    distribuidor: (parent, { id }, { db }) => getById(TABLE, id, db),
    distribuidores: (parent, args, { db }) =>
      getAllLimitOffset(TABLE, args, db),
  },
  Mutation: {
    createDistribuidor: (parent, args, { db }) =>
      createWithCuid(TABLE, args, db),
    updateDistribuidor: (parent, args, { db }) => updateById(TABLE, args, db),
    deleteDistribuidor: (parent, { id }, { db }) => deleteById(TABLE, id, db),
  },
  Distribuidor: {
    consigna: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Consigna where idDistribuidor = $idDistribuidor order by fecha desc, id desc limit $last',
            {
              $idDistribuidor: parent.id,
              $last: last,
            }
          )
          .then((data) => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Consigna where idDistribuidor = $idDistribuidor order by fecha, id limit $limit offset $offset',
          {
            $idDistribuidor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Consigna where idDistribuidor = $idDistribuidor order by fecha, id',
        {
          $idDistribuidor: parent.id,
        }
      );
    },
    existencias: (parent, args, { db }) =>
      db
        .get(
          `select 
            total(entregados) - total(vendidos) - total(devueltos) as existencias 
            from Consigna where idDistribuidor = $idDistribuidor`,
          {
            $idDistribuidor: parent.id,
          }
        )
        .then((row) => row.existencias),
    entregados: (parent, args, { db }) =>
      db
        .get(
          `select total(entregados) as entregados
            from Consigna where idDistribuidor = $idDistribuidor`,
          {
            $idDistribuidor: parent.id,
          }
        )
        .then((row) => row.entregados),
  },
};
