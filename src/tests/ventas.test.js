import gqlFetch from './gqlfetch';

describe('Ventas', () => {
  describe('ventas', () => {
    const query = gqlFetch(`
    query ($offset: Int, $limit: Int, $last: Int) {
      ventas(offset: $offset, limit: $limit, last: $last) {
        concepto
        fecha
        vendedor {
          nombre
        }
      }
    }
  `);
    test('todas las ventas', () =>
      query().then(result => {
        const { ventas } = result.data.data;
        expect(ventas.length).toBe(37);
        expect(
          ventas.reduce(
            (anterior, v) => (v.fecha >= anterior ? v.fecha : 'xxx'),
            ''
          )
        ).not.toBe('xxx');
      }));
    test('ultimas 5 ventas', () =>
      query({ last: 5 }).then(result => {
        const { ventas } = result.data.data;
        expect(ventas.length).toBe(5);
        expect(
          ventas.reduce(
            (anterior, v) => (v.fecha >= anterior ? v.fecha : 'xxx'),
            ''
          )
        ).not.toBe('xxx');
      }));
  });
  describe('single Venta', () => {
    let ventaId;
    beforeAll(() =>
      gqlFetch(`query {
        ventas(last: 1) {
          id
        }
      }`)().then(result => {
        ventaId = result.data.data.ventas[0].id;
      })
    );
    const query = gqlFetch(`
    query ($id: ID!) {
      venta(id:$id) {
        concepto
        fecha
        vendedor {
          nombre
        }
      }
    }
  `);
    test('venta', () =>
      query({ id: ventaId }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "venta": Object {
                "concepto": "Ángela España Borja (Murcia)",
                "fecha": "2018-11-13T23:00:00.000Z",
                "vendedor": Object {
                  "nombre": "Roxana Cabut",
                },
              },
            },
          }
        `);
      }));
  });
});
