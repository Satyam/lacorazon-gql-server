export function compareFecha(a, b) {
  if (a.fecha < b.fecha) {
    return -1;
  }
  if (a.fecha > b.fecha) {
    return 1;
  }
  return 0;
}

export const hola = 'hola';
