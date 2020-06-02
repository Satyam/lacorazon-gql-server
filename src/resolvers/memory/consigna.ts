import { compareFecha, slice } from './utils';

export default {
  Query: {
    consigna: (parent, { id }: { id: ID }, { data }: { data: JSONData }) => data.consigna[id],
    consignas: (parent, args: Rango, { data }: { data: JSONData }) =>
      slice(Object.values(data.consigna).sort(compareFecha), args),
  },
  Consigna: {
    vendedor: (parent: Consignacion, args, { data }: { data: JSONData }) => data.users[parent.idVendedor],
    distribuidor: (parent: Consignacion, args, { data }: { data: JSONData }) =>
      data.distribuidores[parent.idDistribuidor],
  },
};
