import { gql } from 'apollo-server';

import type { Venta } from '../resolvers';
import { getQuery, initTestClient, killPrisma } from './getApolloTestServer';

beforeAll(initTestClient);
afterAll(killPrisma);

describe('Ventas', () => {
  describe('ventas', () => {
    const queryVentas = getQuery<
      Rango & { idVendedor?: ID },
      { ventas: Venta[] }
    >(gql`
      query($offset: Int, $limit: Int, $last: Int, $idVendedor: ID) {
        ventas(
          offset: $offset
          limit: $limit
          last: $last
          idVendedor: $idVendedor
        ) {
          concepto
          fecha
          vendedor {
            nombre
          }
        }
      }
    `);

    test('todas las ventas', async () => {
      const result = await queryVentas({});
      expect(result.errors).toBeUndefined();
      const { ventas } = result.data;
      expect(ventas.length).toBe(8);
      expect(
        ventas.reduce(
          (anterior: string | Date, v: Venta): string | Date =>
            v.fecha >= anterior ? v.fecha : 'xxx',
          ''
        )
      ).not.toBe('xxx');
    });

    test('ultimas 3 ventas', async () => {
      const result = await queryVentas({ last: 3 });
      expect(result.errors).toBeUndefined();
      const { ventas } = result.data;
      expect(ventas.length).toBe(3);
      expect(
        ventas.reduce(
          (anterior: string | Date, v: Venta): string | Date =>
            v.fecha >= anterior ? v.fecha : 'xxx',
          ''
        )
      ).not.toBe('xxx');
      expect(ventas).toMatchInlineSnapshot(`
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
                                `);
    });

    test('2 ventas pasando la tercera', async () => {
      const result = await queryVentas({ limit: 2, offset: 3 });
      expect(result.errors).toBeUndefined();
      const { ventas } = result.data;
      expect(ventas.length).toBe(2);
      expect(
        ventas.reduce(
          (anterior: string | Date, v: Venta): string | Date =>
            v.fecha >= anterior ? v.fecha : 'xxx',
          ''
        )
      ).not.toBe('xxx');
      expect(ventas).toMatchInlineSnapshot(`
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
                                `);
    });

    test('Todas las ventas de u3', async () => {
      const result = await queryVentas({ idVendedor: 'u3' });
      expect(result.errors).toBeUndefined();
      const { ventas } = result.data;
      expect(ventas.length).toBe(2);
      expect(ventas).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "concepto": "3ra venta",
                        "fecha": "2018-03-03T23:00:00.000Z",
                        "vendedor": Object {
                          "nombre": "Usuario 3",
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
                `);
    });

    test('Las 2 últimas ventas de u1', async () => {
      const result = await queryVentas({ idVendedor: 'u1', last: 2 });
      expect(result.errors).toBeUndefined();
      const { ventas } = result.data;
      expect(ventas.length).toBe(2);
      expect(ventas).toMatchInlineSnapshot(`
                              Array [
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
                        `);
    });

    test('Una venta de u1 salteando la primera', async () => {
      const result = await queryVentas({
        idVendedor: 'u1',
        offset: 1,
        limit: 1,
      });
      expect(result.errors).toBeUndefined();
      const { ventas } = result.data;
      expect(ventas.length).toBe(1);
      expect(ventas).toMatchInlineSnapshot(`
          Array [
            Object {
              "concepto": "6ta venta",
              "fecha": "2018-10-03T23:00:00.000Z",
              "vendedor": Object {
                "nombre": "Usuario 1",
              },
            },
          ]
        `);
    });
  });

  describe('single Venta', () => {
    test('venta', async () => {
      const result1 = await getQuery<
        Record<string, unknown>,
        { ventas: Venta[] }
      >(gql`
        query {
          ventas(last: 1) {
            id
          }
        }
      `)({});
      const ventaId = result1.data.ventas[0].id;

      const result = await getQuery<{ id: ID }, Venta>(gql`
        query($id: ID!) {
          venta(id: $id) {
            concepto
            fecha
            vendedor {
              nombre
            }
          }
        }
      `)({
        id: ventaId,
      });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "venta": Object {
            "concepto": "8va venta",
            "fecha": "2018-11-03T23:00:00.000Z",
            "vendedor": Object {
              "nombre": "Usuario 1",
            },
          },
        }
      `);
    });
  });
});
