import { compareFecha, slice } from './utils';

export default {
  Query: {
    consigna: (parent, { id }, { data }) => data.consigna[id],
    consignas: (parent, args, { data }) =>
      slice(Object.values(data.consigna).sort(compareFecha), args),
  },
  Consigna: {
    vendedor: (parent, args, { data }) => data.users[parent.idVendedor],
    distribuidor: (parent, args, { data }) =>
      data.distribuidores[parent.idDistribuidor],
  },
};
