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
  },
};
