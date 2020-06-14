import type { Ventas, Users } from '@prisma/client';
import type { prismaContext } from '.';

export default {
  Query: {
    venta: (
      _: unused,
      { id }: { id: number },
      { prisma }: prismaContext
    ): Promise<Ventas | null> => prisma.ventas.findOne({ where: { id } }),
    ventas: (
      _: unused,
      { idVendedor, ...rango }: Rango & { idVendedor: ID },
      { prisma }: prismaContext
    ): Promise<Ventas[]> =>
      prisma.ventas.findMany({
        where: { idVendedor: <string>idVendedor },
        skip: rango.offset,
        take: rango.limit,
        orderBy: { fecha: 'desc', id: 'asc' },
        // Falta rango.last
      }),
  },
  Mutation: {
    createVenta: (
      _: unused,
      venta: Ventas,
      { prisma }: prismaContext
    ): Promise<Ventas> => prisma.ventas.create({ data: venta }),
    updateVenta: (
      _: unused,
      venta: Ventas,
      { prisma }: prismaContext
    ): Promise<Ventas> => {
      const { id, ...data } = venta;
      return prisma.ventas.update({
        data,
        where: { id },
      });
    },
    deleteVenta: (
      _: unused,
      { id }: { id: number },
      { prisma }: prismaContext
    ): Promise<Ventas> =>
      prisma.ventas.delete({
        where: { id },
      }),
  },
  Venta: {
    vendedor: (
      venta: Ventas,
      _: unused,
      { prisma }: prismaContext
    ): Promise<Users | null> =>
      venta.idVendedor
        ? prisma.users.findOne({ where: { id: venta.idVendedor } })
        : Promise.resolve(null),
  },
};
