import type { Consignacion, User, Distribuidor } from '..';
import { jsonContext } from '.';
import { compareFecha, slice } from './utils';

export default {
  Query: {
    consigna: (
      _: unused,
      { id }: { id: ID },
      { data }: jsonContext
    ): Consignacion => data.consigna[id],
    consignas: (
      _: unused,
      rango: Rango,
      { data }: jsonContext
    ): Consignacion[] =>
      slice(Object.values(data.consigna).sort(compareFecha), rango),
  },
  Consigna: {
    vendedor: (
      consignacion: Consignacion,
      _: unused,
      { data }: jsonContext
    ): User | undefined =>
      consignacion.idVendedor ? data.users[consignacion.idVendedor] : undefined,
    distribuidor: (
      consignacion: Consignacion,
      _: unused,
      { data }: jsonContext
    ): Distribuidor | undefined =>
      consignacion.idDistribuidor
        ? data.distribuidores[consignacion.idDistribuidor]
        : undefined,
  },
};
