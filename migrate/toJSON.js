import { writeJson } from 'fs-extra';
import cuid from 'cuid';

import { ventaDirecta, enConsigna, puntosDeVenta, salidas } from './data.json';

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
          vendedor: v.vendedor.toLowerCase(),
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
          distribuidor: codigo.toLowerCase(),
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
    users: {
      ro: {
        id: 'ro',
        nombre: 'Roxana Cabut',
        email: 'RoxanaCabut@gmail.com',
      },
      ra: {
        id: 'ra',
        nombre: 'Raed El Younsi',
        email: 'reyezuelo@gmail.com',
      },
      rora: {
        id: 'rora',
        nombre: 'Roxana & Raed',
        email: 'reyezuelo@gmail.com;RoxanaCabut@gmail.com',
      },
    },
  },
  { spaces: 2 }
).then(() => console.log('exito'));
