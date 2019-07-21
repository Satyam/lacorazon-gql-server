import sqlite from 'sqlite';
import 'dotenv/config';
import argon2 from 'argon2';
import {
  ventaDirecta,
  enConsigna,
  puntosDeVenta,
  salidas,
  usuarios,
} from './data.json';

const create = [
  'drop table if exists Users',
  `create table Users (
    id text not null unique,
    nombre text not null,
    email text default '',
    password text default ''
  )`,
  `CREATE UNIQUE INDEX userId ON Users(id)`,
  `CREATE UNIQUE INDEX userNombre ON Users(nombre)`,

  'drop table if exists Distribuidores',
  `create table Distribuidores (
    id text not null unique,
    nombre text not null,
    localidad text  default '',
    contacto text default '',
    telefono text default '',
    email text default '',
    direccion text default ''
  )`,
  'create unique index distribuidorId on Distribuidores(id)',
  'create unique index distribuidorNombre on Distribuidores(nombre)',

  'drop table if exists Consigna',
  `create table Consigna (
    id integer primary key,
    fecha text default CURRENT_TIMESTAMP,
    idDistribuidor text default '',
    idVendedor text default '',
    entregados integer default 0,
    porcentaje integer default 0,
    vendidos integer default 0,
    devueltos integer default 0,
    cobrado integer default 0,
    iva boolean default 0,
    comentarios text default ''
)`,

  'drop table if exists Ventas',
  `create table Ventas (
    id integer primary key,
    concepto text default '',
    fecha text default CURRENT_TIMESTAMP,
    idVendedor text default '',
    cantidad integer default 0,
    precioUnitario integer default 0,
    iva boolean default 0
  )`,
  'drop table if exists Salidas',
  `create table Salidas (
    id integer primary key,
    fecha text default CURRENT_TIMESTAMP,
    concepto text default '',
    importe integer default 0
  )`,
];

sqlite.open(process.env.SQLITE_FILE).then(db => {
  create
    .reduce((p, s) => p.then(() => db.run(s)), Promise.resolve())
    .then(() =>
      usuarios.reduce(
        (p, u) =>
          p.then(() =>
            argon2.hash(u.nombre).then(password =>
              db.run(
                `insert into Users 
              (id, nombre, email, password) 
              values ($id, $nombre, $email, $password)`,
                {
                  $id: u.id,
                  $nombre: u.nombre,
                  $email: u.email,
                  $password: password,
                }
              )
            )
          ),
        Promise.resolve()
      )
    )
    .then(() =>
      ventaDirecta.reduce(
        (p, v) =>
          p.then(() =>
            db.run(
              `insert into Ventas 
                ( concepto , fecha, idVendedor , cantidad ,  precioUnitario)
                values ($concepto, $fecha, $idVendedor , $cantidad ,  $precioUnitario)`,
              {
                $concepto: v.concepto || '',
                $fecha: v.fecha || new Date().toISOString(),
                $idVendedor: v.vendedor.toLowerCase(),
                $cantidad: v.cantidad || 0,
                $precioUnitario: v.precioUnitario || 0,
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
                  idDistribuidor,
                  fecha,
                  idVendedor,
                  entregados,
                  porcentaje,
                  vendidos,
                  devueltos,
                  cobrado,
                  iva,
                  comentarios
                ) values (
                  $idDistribuidor,
                  $fecha,
                  $idVendedor,
                  $entregados,
                  $porcentaje,
                  $vendidos,
                  $devueltos,
                  $cobrado,
                  $iva,
                  $comentarios
                )`,
              {
                $idDistribuidor: (v.codigo || '').toLowerCase(),
                $fecha: v.fecha || new Date().toISOString(),
                $idVendedor: (v.vendedor || '').toLowerCase(),
                $entregados: v.entregados || 0,
                $porcentaje: v.porcentaje || 0,
                $vendidos: v.vendidos || 0,
                $devueltos: v.devueltos || 0,
                $cobrado: v.cobrado || 0,
                $iva: v.iva || 0,
                $comentarios: v.comentarios || '',
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
                localidad,
                contacto,
                telefono,
                email,
                direccion)
              values ( 
                $id,
                $nombre,
                $localidad,
                $contacto,
                $telefono,
                $email,
                $direccion)`,
              {
                $id: v.codigo.toLowerCase(),
                $nombre: v.nombre,
                $localidad: v.localidad || '',
                $contacto: v.contacto || '',
                $telefono: v.telefono || '',
                $email: v.email || '',
                $direccion: v.direccion || '',
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
                $fecha: v.fecha || new Date().toISOString(),
                $concepto: v.concepto || '',
                $importe: v.importe || 0,
              }
            )
          ),
        Promise.resolve()
      )
    );
});
