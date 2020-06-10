import cuid from 'cuid';
import { RecordWithId } from '..';

export function compareFecha(
  a: { fecha: Date; id: ID },
  b: { fecha: Date; id: ID }
): number {
  if (a.fecha < b.fecha) return -1;
  if (a.fecha > b.fecha) return 1;
  if (a.id > b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

export function compareString(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function compareStringField(
  field: string
): (
  a: { [field: string]: unknown },
  b: { [field: string]: unknown }
) => number {
  return (a: { [field: string]: unknown }, b: { [field: string]: unknown }) => {
    const fa = <string>a[field];
    const fb = <string>b[field];
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

export function pickFields<R extends RecordWithId>(
  fila: R,
  camposSalida?: Array<keyof R>
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

export function getById<R extends RecordWithId>(
  tabla: { [id: string]: R },
  id: ID,
  camposSalida?: Array<keyof R>
): Partial<R> {
  return pickFields<R>(tabla[id], camposSalida);
}

export function getAllLimitOffset<R extends RecordWithId>(
  tabla: { [id: string]: R },
  rango: Rango,
  camposSalida?: Array<keyof R>
): Array<Partial<R>> {
  const ret = slice(
    Object.values(tabla).sort(compareStringField('nombre')),
    rango
  );
  if (camposSalida) {
    return ret.map((fila) => pickFields<R>(fila, camposSalida));
  }
  return ret;
}

export function createWithCuid<R extends RecordWithId>(
  tabla: { [id: string]: R },
  fila: Partial<R & { nombre: string }>,
  camposSalida?: Array<keyof R>
): Partial<R> {
  const id = cuid();
  if (id in tabla) {
    throw new Error(`Primary key id clash`);
  }
  if (
    Object.values(tabla).find(
      (d: R & { nombre?: string }) =>
        'nombre' in d && 'nombre' in fila && d.nombre === fila.nombre
    )
  ) {
    throw new Error(`Duplicate nombre ${fila.nombre} found`);
  }
  const d = {
    id,
    ...fila,
  };
  // eslint-disable-next-line no-param-reassign
  tabla[id] = <R>d;
  return pickFields<R>(<R>d, camposSalida);
}

export function updateById<R extends RecordWithId>(
  tabla: { [id: string]: R },
  fila: PartialExcept<R, 'id'>,
  camposSalida?: Array<keyof R>
): Partial<R> {
  const { id, ...rest } = fila;
  const d = tabla[id];
  tabla[id] = {
    ...d,
    ...rest,
  };
  return pickFields<R>(tabla[id], camposSalida);
}

export function deleteWithId<R extends RecordWithId>(
  tabla: { [id: string]: R },
  id: ID,
  camposSalida?: Array<keyof R>
): Partial<R> {
  const d = tabla[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  // eslint-disable-next-line no-param-reassign
  delete tabla[id];
  return pickFields<R>(d, camposSalida);
}
