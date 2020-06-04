import cuid from 'cuid';
import { Tabla } from '.'
import { Fila, Venta } from '..'

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
  arr: Fila[],
  { offset = 0, limit = Number.MAX_SAFE_INTEGER, last }: Rango
) {
  return last ? arr.slice(-last) : arr.slice(offset, offset + limit);
}

export function pickFields(fila: Partial<Fila>, camposSalida?: string[]) {
  if (camposSalida && fila) {
    const ret: Partial<Fila> = {};
    camposSalida.forEach((k: keyof Fila) => {
      ret[k] = fila[k];
    });
    return ret;
  }
  return fila;
}

export function getById(tabla: Tabla, id: ID, camposSalida?: string[]) {
  return pickFields(tabla[id], camposSalida);
}

export function getAllLimitOffset(tabla: Tabla, rango: Rango, camposSalida?: string[]) {
  const ret = slice(
    Object.values(tabla).sort(compareStringField('nombre')),
    rango
  );
  if (camposSalida) {
    return ret.map((fila) => pickFields(fila, camposSalida));
  }
  return ret;
}

export function createWithCuid(tabla: Tabla, fila: Fila, camposSalida?: string[]) {
  const id = cuid();
  if (id in tabla) {
    throw new Error(`Primary key id clash`);
  }
  if ('nombre' in fila) {
    if (Object.values(tabla).find((d) => d.nombre === fila.nombre)) {
      throw new Error(`Duplicate nombre ${fila.nombre} found`);
    }
  }
  const d = {
    id,
    ...fila,
  };
  // eslint-disable-next-line no-param-reassign
  tabla[id] = d;
  return pickFields(d, camposSalida);
}

export function updateById(tabla: Tabla, fila: Partial<Fila>, camposSalida?: string[]) {
  const { id, ...rest } = fila;
  const d: Fila = tabla[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  Object.keys(rest).forEach((k: keyof Omit<Fila, 'id'>) => {
    d[k] = rest[k];
  });
  return pickFields(d, camposSalida);
}

export function deleteWithId(tabla: Tabla, id: ID, camposSalida?: string[]) {
  const d = tabla[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  // eslint-disable-next-line no-param-reassign
  delete tabla[id];
  return pickFields(d, camposSalida);
}
