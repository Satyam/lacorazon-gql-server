import { Distribuidor } from '..'
import type { sqlContext } from '.'

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
    distribuidor: (_: unused, { id }: { id: ID }, { db }: sqlContext) => getById(TABLE, id, db),
    distribuidores: (_: unused, rango: Rango, { db }: sqlContext) =>
      getAllLimitOffset(TABLE, rango, db),
  },
  Mutation: {
    createDistribuidor: (_: unused, distribuidor: Distribuidor, { db }: sqlContext) =>
      createWithCuid(TABLE, distribuidor, db),
    updateDistribuidor: (_: unused, distribuidor: Distribuidor, { db }: sqlContext) => updateById(TABLE, distribuidor, db),
    deleteDistribuidor: (_: unused, { id }: { id: ID }, { db }: sqlContext) => deleteById(TABLE, id, db),
  },
  Distribuidor: {
    consigna: (parent: Distribuidor, { offset = 0, limit, last }: Rango, { db }: sqlContext) => {
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
    existencias: (parent: Distribuidor, _: unused, { db }: sqlContext) =>
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
    entregados: (parent: Distribuidor, _: unused, { db }: sqlContext) =>
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
