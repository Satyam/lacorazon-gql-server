import type { Request, Response } from 'express';
import userResolvers from './user';
import ventaResolvers from './venta';
import distribuidorResolvers from './distribuidor';
import consignaResolvers from './consigna';

import type { Consignacion, Distribuidor, Salida, User, Venta } from '..';

type Consigna = { [id: string]: Consignacion };
type Distribuidores = { [id: string]: Distribuidor };
type Salidas = { [id: string]: Salida };
type Users = { [id: string]: User };
type Ventas = { [id: string]: Venta };
export type Tabla = Consigna | Distribuidores | Salidas | Users | Ventas;

export type JSONData = {
  ventas: Ventas;
  consigna: Consigna;
  distribuidores: Distribuidores;
  salidas: Salidas;
  users: Users;
};

export interface jsonContext {
  req: Request & {
    currentUser: string;
  };
  res: Response;
  data: JSONData;
  permissions: string[];
}

import type { Context } from '..';

export async function getContext(): Promise<Context | undefined> {
  console.log('Start with JSON');
  const jsonFile = process.env.JSON_FILE;
  if (jsonFile) {
    const fs = await import('fs-extra');
    const data: JSONData = await fs.readJson(jsonFile);
    if (data)
      return {
        resolvers: [
          userResolvers,
          ventaResolvers,
          distribuidorResolvers,
          consignaResolvers,
        ],
        context: { data },
      };
  }
  console.error('Environment variable JSON_FILE is required');
}
