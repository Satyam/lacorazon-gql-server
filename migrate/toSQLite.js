import sqlite from 'sqlite';
import 'dotenv/config';

import { ventaDirecta, enConsigna, puntosDeVenta, salidas } from './data.json';

const create = [
  'drop table if exists Users',
  `create table Users (
    id text not null unique,
    nombre text not null,
    email text
  )`,
  `CREATE UNIQUE INDEX userId ON Users(id)`,
  `CREATE UNIQUE INDEX userNombre ON Users(nombre)`,
  `insert into Users (id, nombre, email) values
    ('ro','Roxana Cabut','RoxanaCabut@gmail.com'),
    ('ra','Raed El Younsi','reyezuelo@gmail.com'),
    ('rora','Roxana & Raed','reyezuelo@gmail.com;RoxanaCabut@gmail.com')
  `,
  'drop table if exists Distribuidores',
  `create table Distribuidores (
    id text not null unique,
    nombre text not null,
    entregados integer,
    existencias integer,
    localidad text,
    contacto text,
    telefono text,
    email text,
    direccion text
  )`,
  'create unique index distribuidorId on Distribuidores(id)',
  'create unique index distribuidorNombre on Distribuidores(nombre)',
  'drop table if exists Consigna',
  `create table Consigna (
    id integer primary key,
    fecha text,
    distribuidor text,
    vendedor text,
    entregados integer,
    porcentaje float,
    vendidos integer,
    devueltos integer,
    cobrado float,
    iva boolean,
    comentarios text
)`,
  'drop table if exists Ventas',
  `create table Ventas (
    id integer primary key,
    concepto text,
    fecha text,
    vendedor text,
    cantidad integer,
    precioUnitario float
  )`,
  'drop table if exists Salidas',
  `create table Salidas (
    id integer primary key,
    fecha text,
    concepto text,
    importe float
  )`,
];
sqlite.open(process.env.SQLITE_FILE).then(db => {
  create
    .reduce((p, s) => p.then(() => db.run(s)), Promise.resolve())
    .then(() =>
      ventaDirecta.reduce(
        (p, v) =>
          p.then(() =>
            db.run(
              `insert into Ventas 
                ( concepto , fecha, vendedor , cantidad ,  precioUnitario)
                values ($concepto, $fecha, $vendedor , $cantidad ,  $precioUnitario)`,
              {
                $concepto: v.concepto,
                $fecha: v.fecha,
                $vendedor: v.vendedor.toLowerCase(),
                $cantidad: v.cantidad,
                $precioUnitario: v.precioUnitario,
              }
            )
          ),
        Promise.resolve()
      )
    )
    .then(() =>
      enConsigna.reduce(
        (p, v) =>
          p.then(() =>
            db.run(
              `insert into Consigna ( 
                  distribuidor,
                  fecha,
                  vendedor,
                  entregados,
                  porcentaje,
                  vendidos,
                  devueltos,
                  cobrado,
                  iva,
                  comentarios
                ) values (
                  $distribuidor,
                  $fecha,
                  $vendedor,
                  $entregados,
                  $porcentaje,
                  $vendidos,
                  $devueltos,
                  $cobrado,
                  $iva,
                  $comentarios
                )`,
              {
                $distribuidor: v.codigo.toLowerCase(),
                $fecha: v.fecha,
                $vendedor: v.vendedor.toLowerCase(),
                $entregados: v.entregados,
                $porcentaje: v.porcentaje,
                $vendidos: v.vendidos,
                $devueltos: v.devueltos,
                $cobrado: v.cobrado,
                $iva: v.iva,
                $comentarios: v.comentarios,
              }
            )
          ),
        Promise.resolve()
      )
    )
    .then(() =>
      puntosDeVenta.reduce(
        (p, v) =>
          p.then(() =>
            db.run(
              `insert into Distribuidores 
              ( id,
                nombre,
                entregados,
                existencias,
                localidad,
                contacto,
                telefono,
                email,
                direccion)
              values ( 
                $id,
                $nombre,
                $entregados,
                $existencias,
                $localidad,
                $contacto,
                $telefono,
                $email,
                $direccion)`,
              {
                $id: v.codigo.toLowerCase(),
                $nombre: v.nombre,
                $entregados: v.entregados,
                $existencias: v.existencias,
                $localidad: v.localidad,
                $contacto: v.contacto,
                $telefono: v.telefono,
                $email: v.email,
                $direccion: v.direccion,
              }
            )
          ),
        Promise.resolve()
      )
    )
    .then(() =>
      salidas.reduce(
        (p, v) =>
          p.then(() =>
            db.run(
              `insert into Salidas 
              ( fecha, concepto, importe )
              values ( $fecha, $concepto, $importe)`,
              {
                $fecha: v.fecha,
                $concepto: v.concepto,
                $importe: v.importe,
              }
            )
          ),
        Promise.resolve()
      )
    );
});
