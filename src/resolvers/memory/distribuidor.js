import { compareStringField, compareFecha, slice } from './utils';

export default {
  Query: {
    distribuidor: (parent, { id }, { data }) =>
      data.distribuidores[id.toLowerCase()],
    distribuidores: (parent, args, { data }) =>
      slice(
        Object.values(data.distribuidores).sort(compareStringField('nombre')),
        args
      ),
  },
  Distribuidor: {
    consigna: (parent, args, { data }) =>
      slice(
        Object.values(data.consigna)
          .filter(consigna => consigna.distribuidor === parent.id)
          .sort(compareFecha),
        args
      ),
    existencias: (parent, args, { data }) =>
      Object.values(data.consigna).reduce(
        (existencias, c) =>
          existencias +
          (c.distribuidor === parent.id
            ? (c.entregados || 0) - (c.vendidos || 0) - (c.devueltos || 0)
            : 0),
        0
      ),
    entregados: (parent, args, { data }) =>
      Object.values(data.consigna).reduce(
        (entregados, c) =>
          entregados + (c.distribuidor === parent.id ? c.entregados || 0 : 0),
        0
      ),
  },
};
