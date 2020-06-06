import type { Distribuidor } from '..';
import { jsonContext } from '.';
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
    distribuidor: (_: unused, { id }: { id: ID }, { data }: jsonContext) =>
      getById(data.distribuidores, id),
    distribuidores: (_: unused, rango: Rango, { data }: jsonContext) =>
      getAllLimitOffset(data.distribuidores, rango),
  },
  Mutation: {
    createDistribuidor: (
      _: unused,
      distribuidor: Distribuidor,
      { data }: jsonContext
    ) => createWithCuid(data.distribuidores, distribuidor),
    updateDistribuidor: (
      _: unused,
      distribuidor: Distribuidor,
      { data }: jsonContext
    ) => updateById(data.distribuidores, distribuidor),
    deleteDistribuidor: (
      _: unused,
      { id }: { id: ID },
      { data }: jsonContext
    ) => deleteWithId(data.distribuidores, id),
  },
  Distribuidor: {
    consigna: (parent: Distribuidor, rango: Rango, { data }: jsonContext) =>
      slice(
        Object.values(data.consigna)
          .filter((consigna) => consigna.idDistribuidor === parent.id)
          .sort(compareFecha),
        rango
      ),
    existencias: (parent: Distribuidor, _: unused, { data }: jsonContext) =>
      Object.values(data.consigna).reduce(
        (existencias, c) =>
          existencias +
          (c.idDistribuidor === parent.id
            ? (c.entregados || 0) - (c.vendidos || 0) - (c.devueltos || 0)
            : 0),
        0
      ),
    entregados: (parent: Distribuidor, _: unused, { data }: jsonContext) =>
      Object.values(data.consigna).reduce(
        (entregados, c) =>
          entregados + (c.idDistribuidor === parent.id ? c.entregados || 0 : 0),
        0
      ),
  },
};
