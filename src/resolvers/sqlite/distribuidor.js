import {
  getWithId,
  getAllLimitOffset,
  createWithId,
  updateWithId,
  deleteWithId,
} from './utils';

const TABLE = 'Distribuidores';

export default {
  Query: {
    distribuidor: (parent, { id }, { db }) => getWithId(TABLE, id, db),
    distribuidores: (parent, args, { db }) =>
      getAllLimitOffset(TABLE, args, db),
  },
  Mutation: {
    createDistribuidor: (parent, args, { db }) => createWithId(TABLE, args, db),
    updateDistribuidor: (parent, args, { db }) => updateWithId(TABLE, args, db),
    deleteDistribuidor: (parent, { id }, { db }) => deleteWithId(TABLE, id, db),
  },
  Distribuidor: {
    consigna: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Consigna where distribuidor = $distribuidor order by fecha desc, id desc limit $last',
            {
              $distribuidor: parent.id,
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Consigna where distribuidor = $distribuidor order by fecha, id limit $limit offset $offset',
          {
            $distribuidor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Consigna where distribuidor = $distribuidor order by fecha, id',
        {
          $distribuidor: parent.id,
        }
      );
    },
    existencias: (parent, args, { db }) =>
      db
        .get(
          `select 
            total(entregados) - total(vendidos) - total(devueltos) as existencias 
            from Consigna where distribuidor = $distribuidor`,
          {
            $distribuidor: parent.id,
          }
        )
        .then(row => row.existencias),
    entregados: (parent, args, { db }) =>
      db
        .get(
          `select total(entregados) as entregados
            from Consigna where distribuidor = $distribuidor`,
          {
            $distribuidor: parent.id,
          }
        )
        .then(row => row.entregados),
  },
};
