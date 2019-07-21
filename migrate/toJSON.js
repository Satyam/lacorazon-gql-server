import 'dotenv/config';
import { writeJson } from 'fs-extra';
import cuid from 'cuid';
import argon2 from 'argon2';

import {
  ventaDirecta,
  enConsigna,
  puntosDeVenta,
  salidas,
  usuarios,
} from './data.json';

Promise.all(
  usuarios.map(u =>
    argon2.hash(u.nombre).then(password => ({ ...u, password }))
  )
)
  .then(users =>
    writeJson(
      'src/data.json',
      {
        ventas: ventaDirecta.reduce((vs, v) => {
          const id = cuid();
          return {
            ...vs,
            [id]: {
              ...v,
              id,
              idVendedor: v.vendedor.toLowerCase(),
            },
          };
        }, {}),
        consigna: enConsigna.reduce((vs, v) => {
          const id = cuid();
          const { codigo, ...rest } = v;
          return {
            ...vs,
            [id]: {
              ...rest,
              idDistribuidor: codigo.toLowerCase(),
              id,
            },
          };
        }, {}),
        distribuidores: puntosDeVenta.reduce((vs, v) => {
          const id = v.codigo.toLowerCase();
          const { codigo, ...rest } = v;
          return {
            ...vs,
            [id]: {
              ...rest,
              id,
            },
          };
        }, {}),
        salidas: salidas.reduce((vs, v) => {
          const id = cuid();
          return {
            ...vs,
            [id]: {
              ...v,
              id,
            },
          };
        }, {}),
        users: users.reduce(
          (us, u) => ({
            ...us,
            [u.id]: u,
          }),
          {}
        ),
      },
      { spaces: 2 }
    )
  )
  .then(() => console.log('exito'));
