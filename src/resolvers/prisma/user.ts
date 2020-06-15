import type { Ventas, Users, UsersSelect } from '@prisma/client';
import cuid from 'cuid';
import type { prismaContext } from '.';

const select: UsersSelect = {
  id: true,
  nombre: true,
  email: true,
};

export default {
  Query: {
    user: (
      _: unused,
      { id }: { id: string },
      { prisma }: prismaContext
    ): Promise<Users | null> => prisma.users.findOne({ where: { id }, select }),
    users: (
      _: unused,
      rango: Rango,
      { prisma }: prismaContext
    ): Promise<Users[]> =>
      rango.last
        ? prisma.users
            .findMany({
              take: rango.last,
              orderBy: { nombre: 'desc' },
            })
            .then((data) => data.reverse())
        : prisma.users.findMany({
            skip: rango.offset,
            take: rango.limit,
            orderBy: { nombre: 'asc' },
          }),
    currentUser: (_: unused, _1: unused, { req }: prismaContext): string =>
      req.currentUser,
  },
  Mutation: {
    createUser: (
      _: unused,
      user: Users,
      { prisma }: prismaContext
    ): Promise<Users> => {
      const id = cuid();
      return prisma.users.create({
        data: {
          ...user,
          id,
        },
        select,
      });
    },
    updateUser: (
      _: unused,
      user: Users,
      { prisma }: prismaContext
    ): Promise<Users> => {
      const { id, ...data } = user;
      return prisma.users.update({
        data,
        where: { id },
        select,
      });
    },
    deleteUser: (
      _: unused,
      { id }: { id: string },
      { prisma }: prismaContext
    ): Promise<Users> => prisma.users.delete({ where: { id }, select }),
  },
  User: {
    ventas: (
      user: Users,
      rango: Rango,
      { prisma }: prismaContext
    ): Promise<Ventas[]> =>
      rango.last
        ? prisma.ventas
            .findMany({
              where: { idVendedor: user.id },
              take: rango.last,
              orderBy: { fecha: 'desc' },
            })
            .then((data) => data.reverse())
        : prisma.ventas.findMany({
            where: { idVendedor: user.id },
            skip: rango.offset,
            take: rango.limit,
            orderBy: { fecha: 'asc' },
          }),
  },
};
