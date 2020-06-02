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
    distribuidor: (parent: unused, { id }: { id: ID }, { db }: sqlContext) => getById(TABLE, id, db),
    distribuidores: (parent: unused, args: Rango, { db }: sqlContext) =>
      getAllLimitOffset(TABLE, args, db),
  },
  Mutation: {
    createDistribuidor: (parent: unused, args: Distribuidor, { db }: sqlContext) =>
      createWithCuid(TABLE, args, db),
    updateDistribuidor: (parent: unused, args: Distribuidor, { db }: sqlContext) => updateById(TABLE, args, db),
    deleteDistribuidor: (parent: unused, { id }: { id: ID }, { db }: sqlContext) => deleteById(TABLE, id, db),
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
    existencias: (parent: Distribuidor, args: unused, { db }: sqlContext) =>
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
    entregados: (parent: Distribuidor, args: unused, { db }: sqlContext) =>
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
