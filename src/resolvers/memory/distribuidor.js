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
    distribuidor: (parent, { id }, { data }) =>
      getById(data.distribuidores, id),
    distribuidores: (parent, args, { data }) =>
      getAllLimitOffset(data.distribuidores, args),
  },
  Mutation: {
    createDistribuidor: (parent, args, { data }) =>
      createWithCuid(data.distribuidores, args),
    updateDistribuidor: (parent, args, { data }) =>
      updateById(data.distribuidores, args),
    deleteDistribuidor: (parent, { id }, { data }) =>
      deleteWithId(data.distribuidores, id),
  },
  Distribuidor: {
    consigna: (parent, args, { data }) =>
      slice(
        Object.values(data.consigna)
          .filter((consigna) => consigna.idDistribuidor === parent.id)
          .sort(compareFecha),
        args
      ),
    existencias: (parent, args, { data }) =>
      Object.values(data.consigna).reduce(
        (existencias, c) =>
          existencias +
          (c.idDistribuidor === parent.id
            ? (c.entregados || 0) - (c.vendidos || 0) - (c.devueltos || 0)
            : 0),
        0
      ),
    entregados: (parent, args, { data }) =>
      Object.values(data.consigna).reduce(
        (entregados, c) =>
          entregados + (c.idDistribuidor === parent.id ? c.entregados || 0 : 0),
        0
      ),
  },
};
