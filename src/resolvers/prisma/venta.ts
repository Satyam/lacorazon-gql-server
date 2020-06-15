import type { Ventas, Users } from '@prisma/client';
import type { prismaContext } from '.';

export default {
  Query: {
    venta: (
      _: unused,
      { id }: { id: ID },
      { prisma }: prismaContext
    ): Promise<Ventas | null> =>
      prisma.ventas.findOne({ where: { id: Number(id) } }),
    ventas: (
      _: unused,
      { idVendedor, ...rango }: Rango & { idVendedor: ID },
      { prisma }: prismaContext
    ): Promise<Ventas[]> => {
      if (rango.last) {
        return prisma.ventas
          .findMany({
            where: { idVendedor: <string>idVendedor },
            take: rango.last,
            orderBy: { fecha: 'desc' },
          })
          .then((data) => data.reverse());
      }
      return prisma.ventas.findMany({
        where: { idVendedor: <string>idVendedor },
        skip: rango.offset,
        take: rango.limit,
        orderBy: { fecha: 'asc' },
      });
    },
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
      { id }: { id: ID },
      { prisma }: prismaContext
    ): Promise<Ventas> =>
      prisma.ventas.delete({
        where: { id: Number(id) },
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
