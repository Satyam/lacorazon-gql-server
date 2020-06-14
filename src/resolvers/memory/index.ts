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
export default [
  userResolvers,
  ventaResolvers,
  distribuidorResolvers,
  consignaResolvers,
];
