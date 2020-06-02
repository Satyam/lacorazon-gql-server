import cuid from 'cuid';
import { Tabla } from '.'
import { Fila } from '..'

export function compareFecha(a: { fecha: Date, id: ID }, b: { fecha: Date, id: ID }) {
  if (a.fecha < b.fecha) return -1;
  if (a.fecha > b.fecha) return 1;
  if (a.id > b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

export function compareString(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function compareStringField(field: string) {
  return (a: { [field: string]: string }, b: { [field: string]: string }) => {
    const fa = a[field];
    const fb = b[field];
    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  };
}

export function slice(
  arr: any[],
  { offset = 0, limit = Number.MAX_SAFE_INTEGER, last }: Rango
) {
  return last ? arr.slice(-last) : arr.slice(offset, offset + limit);
}

export function filterBy(arr: any[], field: string, value: any) {
  return typeof value === 'undefined'
    ? arr
    : arr.filter((row) => row[field] === value);
}

export function pickFields(row: Partial<Fila>, fields: string[]) {
  if (fields && row) {
    const ret = {};
    fields.forEach((k) => {
      ret[k] = row[k];
    });
    return ret;
  }
  return row;
}

export function getById(table: Tabla, id: ID, fields?: string[]) {
  return pickFields(table[id], fields);
}

export function getAllLimitOffset(table: Tabla, args: Rango, fields?: string[]) {
  const ret = slice(
    Object.values(table).sort(compareStringField('nombre')),
    args
  );
  if (fields) {
    return ret.map((row) => pickFields(row, fields));
  }
  return ret;
}

export function createWithCuid(table: Tabla, args: Fila, outFields?: string[]) {
  const id = cuid();
  if (id in table) {
    throw new Error(`Primary key id clash`);
  }
  if ('nombre' in args) {
    if (Object.values(table).find((d) => d.nombre === args.nombre)) {
      throw new Error(`Duplicate nombre ${args.nombre} found`);
    }
  }
  const d = {
    id,
    ...args,
  };
  // eslint-disable-next-line no-param-reassign
  table[id] = d;
  return pickFields(d, outFields);
}

export function updateById(table: Tabla, args: Partial<Fila>, outFields?: string[]) {
  const { id, ...rest } = args;
  const d: Fila = table[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  Object.keys(rest).forEach((k: string) => {
    d[k] = rest[k];
  });
  return pickFields(d, outFields);
}

export function deleteWithId(table: Tabla, id: ID, outFields?: string[]) {
  const d = table[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  // eslint-disable-next-line no-param-reassign
  delete table[id];
  return pickFields(d, outFields);
}
