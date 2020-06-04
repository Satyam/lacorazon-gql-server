import type { Distribuidor } from '..'
import { jsonContext } from '.'
import {
  compareFecha,
  slice,
  getById,
  getAllLimitOffset,
  createWithCuid,
  updateById,
  deleteWithId,
} from './utils';

export default {
  Query: {
    distribuidor: (parent: unused, { id }: { id: ID }, { data }: jsonContext) =>
      getById(data.distribuidores, id),
    distribuidores: (parent: unused, rango: Rango, { data }: jsonContext) =>
      getAllLimitOffset(data.distribuidores, rango),
  },
  Mutation: {
    createDistribuidor: (parent: unused, distribuidor: Distribuidor, { data }: jsonContext) =>
      createWithCuid(data.distribuidores, distribuidor),
    updateDistribuidor: (parent: unused, distribuidor: Distribuidor, { data }: jsonContext) =>
      updateById(data.distribuidores, distribuidor),
    deleteDistribuidor: (parent: unused, { id }: { id: ID }, { data }: jsonContext) =>
      deleteWithId(data.distribuidores, id),
  },
  Distribuidor: {
    consigna: (parent: Distribuidor, args: unused, { data }: jsonContext) =>
      slice(
        Object.values(data.consigna)
          .filter((consigna) => consigna.idDistribuidor === parent.id)
          .sort(compareFecha),
        args
      ),
    existencias: (parent: Distribuidor, args: unused, { data }: jsonContext) =>
      Object.values(data.consigna).reduce(
        (existencias, c) =>
          existencias +
          (c.idDistribuidor === parent.id
            ? (c.entregados || 0) - (c.vendidos || 0) - (c.devueltos || 0)
            : 0),
        0
      ),
    entregados: (parent: Distribuidor, args: unused, { data }: jsonContext) =>
      Object.values(data.consigna).reduce(
        (entregados, c) =>
          entregados + (c.idDistribuidor === parent.id ? c.entregados || 0 : 0),
        0
      ),
  },
};
