import type { Consignacion } from '..'
import { jsonContext } from '.'
import { compareFecha, slice } from './utils';

export default {
  Query: {
    consigna: (parent: unused, { id }: { id: ID }, { data }: jsonContext) => data.consigna[id],
    consignas: (parent: unused, args: Rango, { data }: jsonContext) =>
      slice(Object.values(data.consigna).sort(compareFecha), args),
  },
  Consigna: {
    vendedor: (parent: Consignacion, args: unused, { data }: jsonContext) => data.users[parent.idVendedor],
    distribuidor: (parent: Consignacion, args: unused, { data }: jsonContext) =>
      data.distribuidores[parent.idDistribuidor],
  },
};
