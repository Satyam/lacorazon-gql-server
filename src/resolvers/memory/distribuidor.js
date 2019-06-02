import cuid from 'cuid';
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
  Mutation: {
    createDistribuidor: (parent, args, { data }) => {
      const id = cuid();
      if (id in data.distribuidores) {
        throw new Error(`Primary key id clash`);
      }
      if (
        Object.values(data.distribuidores).find(d => d.nombre === args.nombre)
      ) {
        throw new Error(`Duplicate nombre ${args.nombre} found`);
      }
      const d = {
        id,
        ...args,
      };
      // eslint-disable-next-line no-param-reassign
      data.distribuidores[id] = d;
      return d;
    },
    updateDistribuidor: (parent, args, { data }) => {
      const { id, ...rest } = args;
      const d = data.distribuidores[id];

      if (typeof d === 'undefined') {
        throw new Error(`Distribuidor ${id} not found`);
      }
      Object.keys(rest).forEach(k => {
        d[k] = rest[k];
      });
      return d;
    },
    deleteDistribuidor: (parent, { id }, { data }) => {
      const d = data.distribuidores[id];

      if (typeof d === 'undefined') {
        throw new Error(`Distribuidor ${id} not found`);
      }
      // eslint-disable-next-line no-param-reassign
      delete data.distribuidores[id];
      return d;
    },
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
