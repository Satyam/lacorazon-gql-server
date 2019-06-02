import cuid from 'cuid';

export function compareFecha(a, b) {
  if (a.fecha < b.fecha) {
    return -1;
  }
  if (a.fecha > b.fecha) {
    return 1;
  }
  return a.id - b.id;
}

export function compareString(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function compareStringField(field) {
  return (a, b) => {
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
  arr,
  { offset = 0, limit = Number.MAX_SAFE_INTEGER, last }
) {
  return last ? arr.slice(-last) : arr.slice(offset, offset + limit);
}

export function getWithId(table, id) {
  return table[id];
}
export function getAllLimitOffset(table, args) {
  return slice(Object.values(table).sort(compareStringField('nombre')), args);
}
export function createWithId(table, args) {
  const id = cuid();
  if (id in table) {
    throw new Error(`Primary key id clash`);
  }
  if (Object.values(table).find(d => d.nombre === args.nombre)) {
    throw new Error(`Duplicate nombre ${args.nombre} found`);
  }
  const d = {
    id,
    ...args,
  };
  // eslint-disable-next-line no-param-reassign
  table[id] = d;
  return d;
}
export function updateWithId(table, args) {
  const { id, ...rest } = args;
  const d = table[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  Object.keys(rest).forEach(k => {
    d[k] = rest[k];
  });
  return d;
}
export function deleteWithId(table, id) {
  const d = table[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  // eslint-disable-next-line no-param-reassign
  delete table[id];
  return d;
}
