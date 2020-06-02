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
    distribuidor: (parent, { id }: { id: ID }, { data }: { data: JSONData }) =>
      getById(data.distribuidores, id),
    distribuidores: (parent, args: Rango, { data }: { data: JSONData }) =>
      getAllLimitOffset(data.distribuidores, args),
  },
  Mutation: {
    createDistribuidor: (parent, args: Distribuidor, { data }: { data: JSONData }) =>
      createWithCuid(data.distribuidores, args),
    updateDistribuidor: (parent, args: Distribuidor, { data }: { data: JSONData }) =>
      updateById(data.distribuidores, args),
    deleteDistribuidor: (parent, { id }: { id: ID }, { data }: { data: JSONData }) =>
      deleteWithId(data.distribuidores, id),
  },
  Distribuidor: {
    consigna: (parent: Distribuidor, args, { data }: { data: JSONData }) =>
      slice(
        Object.values(data.consigna)
          .filter((consigna) => consigna.idDistribuidor === parent.id)
          .sort(compareFecha),
        args
      ),
    existencias: (parent: Distribuidor, args, { data }: { data: JSONData }) =>
      Object.values(data.consigna).reduce(
        (existencias, c) =>
          existencias +
          (c.idDistribuidor === parent.id
            ? (c.entregados || 0) - (c.vendidos || 0) - (c.devueltos || 0)
            : 0),
        0
      ),
    entregados: (parent: Distribuidor, args, { data }: { data: JSONData }) =>
      Object.values(data.consigna).reduce(
        (entregados, c) =>
          entregados + (c.idDistribuidor === parent.id ? c.entregados || 0 : 0),
        0
      ),
  },
};
