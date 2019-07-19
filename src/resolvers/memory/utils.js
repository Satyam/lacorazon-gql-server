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

export function filterBy(arr, field, value) {
  return typeof value === 'undefined'
    ? arr
    : arr.filter(row => row[field] === value);
}

export function pickFields(row, fields) {
  if (fields && row) {
    const ret = {};
    fields.forEach(k => {
      ret[k] = row[k];
    });
    return ret;
  }
  return row;
}

export function getById(table, id, fields) {
  return pickFields(table[id], fields);
}
export function getAllLimitOffset(table, args, fields) {
  const ret = slice(
    Object.values(table).sort(compareStringField('nombre')),
    args
  );
  if (fields) {
    return ret.map(row => pickFields(row, fields));
  }
  return ret;
}
export function createWithCuid(table, args, outFields) {
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
  return pickFields(d, outFields);
}
export function updateById(table, args, outFields) {
  const { id, ...rest } = args;
  const d = table[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  Object.keys(rest).forEach(k => {
    d[k] = rest[k];
  });
  return pickFields(d, outFields);
}
export function deleteWithId(table, id, outFields) {
  const d = table[id];

  if (typeof d === 'undefined') {
    throw new Error(`${id} not found`);
  }
  // eslint-disable-next-line no-param-reassign
  delete table[id];
  return pickFields(d, outFields);
}
