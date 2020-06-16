import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
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
  `CREATE TABLE "Users" (
    "id"	text NOT NULL UNIQUE,
    "nombre"	text NOT NULL,
    "email"	text,
    "password"	TEXT
  )`,
  `CREATE UNIQUE INDEX userId ON Users(id)`,
  `CREATE UNIQUE INDEX userNombre ON Users(nombre)`,

  'drop table if exists Distribuidores',
  `CREATE TABLE "Distribuidores" (
    "id"	text NOT NULL UNIQUE,
    "nombre"	text NOT NULL,
    "localidad"	text,
    "contacto"	text,
    "telefono"	text,
    "email"	text,
    "direccion"	text
  )`,
  'create unique index distribuidorId on Distribuidores(id)',
  'create unique index distribuidorNombre on Distribuidores(nombre)',

  'drop table if exists Consigna',
  `CREATE TABLE "Consigna" (
    "id"	INTEGER,
    "fecha"	text,
    "idDistribuidor"	text,
    "idVendedor"	text,
    "entregados"	integer,
    "porcentaje"	float,
    "vendidos"	integer,
    "devueltos"	integer,
    "cobrado"	float,
    "iva"	boolean,
    "comentarios"	text,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("idVendedor") REFERENCES "Users"("id"),
    FOREIGN KEY("idDistribuidor") REFERENCES "Distribuidores"("id")
  )`,

  'drop table if exists Ventas',
  `CREATE TABLE "Ventas" (
    "id"	INTEGER,
    "concepto"	text,
    "fecha"	text,
    "idVendedor"	text,
    "cantidad"	integer,
    "precioUnitario"	float,
    "iva"	boolean,
    PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("idVendedor") REFERENCES "Users"("id")
  )`,
  'drop table if exists Salidas',
  `CREATE TABLE "Salidas" (
    "id"	integer,
    "fecha"	text,
    "concepto"	text,
    "importe"	float,
    PRIMARY KEY("id")
  )`,
];

console.log(open);
open({
  filename: process.env.SQLITE_FILE,
  driver: sqlite3.Database,
}).then((db) => {
  create
    .reduce((p, s) => p.then(() => db.run(s)), Promise.resolve())
    .then(() =>
      usuarios.reduce(
        (p, u) =>
          p.then(() =>
            argon2.hash(u.nombre).then((password) =>
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
