/*
CREATE TABLE Consigna (
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
)
*/

export type Consignacion = {
  id: ID;
  fecha: Date;
  idDistribuidor?: ID;
  idVendedor?: ID;
  entregados?: number;
  porcentaje?: number;
  vendidos?: number;
  devueltos?: number;
  cobrado?: number;
  iva?: boolean;
  comentarios?: string;
};

/*
CREATE TABLE Distribuidores (
    id text not null unique,
    nombre text not null,
    localidad text  default '',
    contacto text default '',
    telefono text default '',
    email text default '',
    direccion text default ''
  )
  */

export type Distribuidor = {
  id: ID;
  nombre: string;
  localidad?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
};

/*
CREATE TABLE Salidas (
  id integer primary key,
  fecha text default CURRENT_TIMESTAMP,
  concepto text default '',
  importe integer default 0
)
*/
export type Salida = {
  id: ID;
  fecha: Date;
  concepto?: string;
  importe?: number;
};

/*
 CREATE TABLE Users (
   id text not null unique,
   nombre text not null,
   email text default '',
   password text default ''
 )
 */
export type User = {
  id: ID;
  nombre: string;
  email?: string;
  password?: string;
};
/*
 CREATE TABLE Ventas (
   id integer primary key,
   concepto text default '',
   fecha text default CURRENT_TIMESTAMP,
   idVendedor text default '',
   cantidad integer default 0,
   precioUnitario integer default 0,
   iva boolean default 0
 )
*/
export type Venta = {
  id: ID;
  concepto?: string;
  fecha: Date;
  idVendedor?: ID;
  cantidad?: number;
  precioUnitario?: number;
  iva?: boolean;
};

export type Fila = Consignacion | Distribuidor | Salida | User | Venta;

export type RecordWithId = { id: ID; [key: string]: unknown };
