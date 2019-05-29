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
