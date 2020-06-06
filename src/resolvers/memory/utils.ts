import cuid from 'cuid';
import { AnyFila } from '..';

export function compareFecha(
  a: { fecha: Date; id: ID },
  b: { fecha: Date; id: ID }
) {
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
  return (a: { [field: string]: any }, b: { [field: string]: any }) => {
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

export function slice<R>(
  arr: R[],
  { offset = 0, limit = Number.MAX_SAFE_INTEGER, last }: Rango
): R[] {
  return last ? arr.slice(-last) : arr.slice(offset, offset + limit);
}

export function pickFields<R extends AnyFila, K extends keyof R>(
  fila: R,
  camposSalida?: K[]
): Partial<R> {
  if (camposSalida && fila) {
    const ret: Partial<R> = {};
    camposSalida.forEach((k) => {
      ret[k] = fila[k];
    });
    return ret;
  }
  return fila;
}

export function getById<R extends AnyFila, K extends keyof R>(
  tabla: { [id: string]: R },
  id: ID,
  camposSalida?: K[]
): Partial<R> {
  return pickFields(tabla[id], camposSalida);
}

export function getAllLimitOffset<R extends AnyFila, K extends keyof R>(
  tabla: { [id: string]: R },
  rango: Rango,
  camposSalida?: K[]
): Array<Partial<R>> {
  const ret = slice(
    Object.values(tabla).sort(compareStringField('nombre')),
    rango
  );
  if (camposSalida) {
    return ret.map((fila) => pickFields(fila, camposSalida));
  }
  return ret;
}

export function createWithCuid<R extends AnyFila, K extends keyof R>(
  tabla: { [id: string]: R },
  fila: Partial<R>,
  camposSalida?: K[]
): Partial<R> {
  const id = cuid();
  if (id in tabla) {
    throw new Error(`Primary key id clash`);
  }
  if (
    Object.values(tabla).find(
      (d) => 'nombre' in d && 'nombre' in fila && d.nombre === fila.nombre
    )
  ) {
    throw new Error(`Duplicate nombre ${fila.nombre} found`);
  }
  const d = {
    id,
    ...fila,
  } as R;
  // eslint-disable-next-line no-param-reassign
  tabla[id] = d;
  return pickFields(d, camposSalida);
}

export function updateById<R extends AnyFila, K extends keyof R>(
  tabla: { [id: string]: R },
  fila: PartialExcept<R, 'id'>,
  camposSalida?: K[]
): Partial<R> {
  const { id, ...rest } = fila;
  const d = tabla[id];
  tabla[id] = {
    ...d,
    ...rest,
  };
  return pickFields(tabla[id], camposSalida);
}

export function deleteWithId<R extends AnyFila, K extends keyof R>(
  tabla: { [id: string]: R },
  id: ID,
  camposSalida?: K[]
): Partial<R> {
  const d = tabla[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  // eslint-disable-next-line no-param-reassign
  delete tabla[id];
  return pickFields(d, camposSalida);
}
