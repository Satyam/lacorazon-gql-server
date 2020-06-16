import type { Distribuidores, Consigna } from '@prisma/client';
import cuid from 'cuid';
import type { prismaContext } from '.';

export default {
  Query: {
    distribuidor: (
      _: unused,
      { id }: { id: string },
      { prisma }: prismaContext
    ): Promise<Distribuidores | null> =>
      prisma.distribuidores.findOne({
        where: { id },
      }),
    distribuidores: (
      _: unused,
      rango: Rango,
      { prisma }: prismaContext
    ): Promise<Distribuidores[]> =>
      rango.last
        ? prisma.distribuidores
            .findMany({
              take: rango.last,
              orderBy: { nombre: 'desc' },
            })
            .then((data) => data.reverse())
        : prisma.distribuidores.findMany({
            skip: rango.offset,
            take: rango.limit,
            orderBy: { nombre: 'asc' },
          }),
  },
  Mutation: {
    createDistribuidor: (
      _: unused,
      distribuidor: Distribuidores,
      { prisma }: prismaContext
    ): Promise<Distribuidores> => {
      const id = cuid();
      return prisma.distribuidores.create({
        data: {
          ...distribuidor,
          id,
        },
      });
    },
    updateDistribuidor: (
      _: unused,
      distribuidor: Distribuidores,
      { prisma }: prismaContext
    ): Promise<Distribuidores> => {
      const { id, ...data } = distribuidor;
      return prisma.distribuidores.update({ data, where: { id } });
    },
    deleteDistribuidor: (
      _: unused,
      { id }: { id: string },
      { prisma }: prismaContext
    ): Promise<Distribuidores> =>
      prisma.distribuidores.delete({ where: { id } }),
  },
  Distribuidor: {
    consigna: (
      distribuidor: Distribuidores,
      rango: Rango,
      { prisma }: prismaContext
    ): Promise<Consigna[]> =>
      rango.last
        ? prisma.consigna
            .findMany({
              where: { idDistribuidor: distribuidor.id },
              take: rango.last,
              orderBy: { fecha: 'desc' },
            })
            .then((data) => data.reverse())
        : prisma.consigna.findMany({
            where: { idDistribuidor: distribuidor.id },
            skip: rango.offset,
            take: rango.limit,
            orderBy: { fecha: 'asc' },
          }),
    existencias: async (
      distribuidor: Distribuidores,
      _: unused,
      { prisma }: prismaContext
    ): Promise<number> => {
      const cs = await prisma.consigna.findMany({
        where: { idDistribuidor: distribuidor.id },
      });
      return cs.reduce(
        (existencias, c) =>
          existencias +
          (c.entregados || 0) -
          (c.vendidos || 0) -
          (c.devueltos || 0),
        0
      );
    },

    entregados: async (
      distribuidor: Distribuidores,
      _: unused,
      { prisma }: prismaContext
    ): Promise<number> => {
      const cs = await prisma.consigna.findMany({
        where: { idDistribuidor: distribuidor.id },
      });
      return cs.reduce((entregados, c) => entregados + (c.entregados || 0), 0);
    },
  },
};
