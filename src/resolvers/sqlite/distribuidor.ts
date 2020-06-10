import { Distribuidor, Consignacion } from '..';
import type { sqlContext } from '.';

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
    distribuidor: (
      _: unused,
      { id }: { id: ID },
      { db }: sqlContext
    ): Promise<Distribuidor | undefined> =>
      getById<Distribuidor>(TABLE, id, db),
    distribuidores: (
      _: unused,
      rango: Rango,
      { db }: sqlContext
    ): Promise<Array<Distribuidor> | undefined> =>
      getAllLimitOffset<Distribuidor>(TABLE, rango, db),
  },
  Mutation: {
    createDistribuidor: (
      _: unused,
      distribuidor: Distribuidor,
      { db }: sqlContext
    ): Promise<Distribuidor | undefined> =>
      createWithCuid<Distribuidor>(TABLE, distribuidor, db),
    updateDistribuidor: (
      _: unused,
      distribuidor: Distribuidor,
      { db }: sqlContext
    ): Promise<Distribuidor | undefined> =>
      updateById<Distribuidor>(TABLE, distribuidor, db),
    deleteDistribuidor: (
      _: unused,
      { id }: { id: ID },
      { db }: sqlContext
    ): Promise<Distribuidor | undefined> =>
      deleteById<Distribuidor>(TABLE, id, db),
  },
  Distribuidor: {
    consigna: (
      parent: Distribuidor,
      { offset = 0, limit, last }: Rango,
      { db }: sqlContext
    ): Promise<Consignacion[] | undefined> => {
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
    existencias: (
      parent: Distribuidor,
      _: unused,
      { db }: sqlContext
    ): Promise<number> =>
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
    entregados: (
      parent: Distribuidor,
      _: unused,
      { db }: sqlContext
    ): Promise<number> =>
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
