import type { Consignacion } from '..'
import { jsonContext } from '.'
import { compareFecha, slice } from './utils';

export default {
  Query: {
    consigna: (_: unused, { id }: { id: ID }, { data }: jsonContext) => data.consigna[id],
    consignas: (_: unused, rango: Rango, { data }: jsonContext) =>
      slice(Object.values(data.consigna).sort(compareFecha), rango),
  },
  Consigna: {
    vendedor: (parent: Consignacion, _: unused, { data }: jsonContext) => data.users[parent.idVendedor],
    distribuidor: (parent: Consignacion, _: unused, { data }: jsonContext) =>
      data.distribuidores[parent.idDistribuidor],
  },
};
