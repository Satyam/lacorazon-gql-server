import type { Consigna, Users, Distribuidores } from '@prisma/client';
import type { prismaContext } from '.';
export default {
  Query: {
    consigna: (
      _: unused,
      { id }: { id: number },
      { prisma }: prismaContext
    ): Promise<Consigna | null> => prisma.consigna.findOne({ where: { id } }),
    consignas: (
      _: unused,
      rango: Rango,
      { prisma }: prismaContext
    ): Promise<Consigna[]> =>
      rango.last
        ? prisma.consigna
            .findMany({
              take: rango.last,
              orderBy: { fecha: 'desc' },
            })
            .then((data) => data.reverse())
        : prisma.consigna.findMany({
            skip: rango.offset,
            take: rango.limit,
            orderBy: { fecha: 'asc' },
          }),
  },
  Consigna: {
    vendedor: (
      consignacion: Consigna,
      _: unused,
      { prisma }: prismaContext
    ): Promise<Users | null> =>
      consignacion.idVendedor
        ? prisma.users.findOne({ where: { id: consignacion.idVendedor } })
        : Promise.resolve(null),
    distribuidor: (
      consignacion: Consigna,
      _: unused,
      { prisma }: prismaContext
    ): Promise<Distribuidores | null> =>
      consignacion.idDistribuidor
        ? prisma.distribuidores.findOne({
            where: { id: consignacion.idDistribuidor },
          })
        : Promise.resolve(null),
  },
};
