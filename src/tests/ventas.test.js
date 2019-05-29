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
        expect(ventas.length).toBe(8);
        expect(
          ventas.reduce(
            (anterior, v) => (v.fecha >= anterior ? v.fecha : 'xxx'),
            ''
          )
        ).not.toBe('xxx');
      }));
    test('ultimas 3 ventas', () =>
      query({ last: 3 }).then(result => {
        const { ventas } = result.data.data;
        expect(ventas.length).toBe(3);
        expect(
          ventas.reduce(
            (anterior, v) => (v.fecha >= anterior ? v.fecha : 'xxx'),
            ''
          )
        ).not.toBe('xxx');
        expect(ventas).toMatchInlineSnapshot(
          `
          Array [
            Object {
              "concepto": "6ta venta",
              "fecha": "2018-10-03T23:00:00.000Z",
              "vendedor": Object {
                "nombre": "Usuario 1",
              },
            },
            Object {
              "concepto": "7ma venta",
              "fecha": "2018-10-04T23:00:00.000Z",
              "vendedor": Object {
                "nombre": "Usuario 1",
              },
            },
            Object {
              "concepto": "8va venta",
              "fecha": "2018-11-03T23:00:00.000Z",
              "vendedor": Object {
                "nombre": "Usuario 1",
              },
            },
          ]
        `
        );
      }));
    test('2 ventas pasando la tercera', () =>
      query({ limit: 2, offset: 3 }).then(result => {
        const { ventas } = result.data.data;
        expect(ventas.length).toBe(2);
        expect(
          ventas.reduce(
            (anterior, v) => (v.fecha >= anterior ? v.fecha : 'xxx'),
            ''
          )
        ).not.toBe('xxx');
        expect(ventas).toMatchInlineSnapshot(
          `
          Array [
            Object {
              "concepto": "4ta venta",
              "fecha": "2018-04-03T23:00:00.000Z",
              "vendedor": Object {
                "nombre": "Usuario 2",
              },
            },
            Object {
              "concepto": "5ta venta",
              "fecha": "2018-09-03T23:00:00.000Z",
              "vendedor": Object {
                "nombre": "Usuario 3",
              },
            },
          ]
        `
        );
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
                "concepto": "8va venta",
                "fecha": "2018-11-03T23:00:00.000Z",
                "vendedor": Object {
                  "nombre": "Usuario 1",
                },
              },
            },
          }
        `);
      }));
  });
});
