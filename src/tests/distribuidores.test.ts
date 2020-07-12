import { gql } from 'apollo-server';
import type { Distribuidor, Consignacion } from '../resolvers';
import {
  getQuery,
  getMutation,
  initTestClient,
  killPrisma,
} from './getApolloTestServer';

beforeAll(initTestClient);
afterAll(killPrisma);

describe('distribuidor', () => {
  const distribuidorQuery = getQuery<
    { id: ID },
    { distribuidor: Distribuidor }
  >(
    gql`
      query($id: ID!) {
        distribuidor(id: $id) {
          nombre
          email
        }
      }
    `
  );

  describe('single distribuidor', () => {
    test('distribuidor d1', async () => {
      const result = await distribuidorQuery({ id: 'd1' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "distribuidor": Object {
            "email": "distr1@correo.com",
            "nombre": "Distrib 1",
          },
        }
      `);
    });

    test('distribuidor d2', async () => {
      const result = await distribuidorQuery({ id: 'd2' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "distribuidor": Object {
            "email": "distr2@correo.com",
            "nombre": "Distrib 2",
          },
        }
      `);
    });

    test('distribuidor xxxx', async () => {
      const result = await distribuidorQuery({ id: 'xxxx' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "distribuidor": null,
        }
      `);
    });
  });

  describe('single distribuidor with stock', () => {
    const queryConsignaDist = getQuery<
      { id: ID; last?: number; offset?: number; limit?: number },
      {
        distribuidor: Distribuidor & { consigna: Consignacion[] };
      }
    >(gql`
      query($id: ID!, $last: Int, $offset: Int, $limit: Int) {
        distribuidor(id: $id) {
          nombre
          email
          entregados
          existencias
          consigna(last: $last, offset: $offset, limit: $limit) {
            fecha
            vendedor {
              nombre
            }
          }
        }
      }
    `);

    test('distribuidor d1, all consigna', async () => {
      const result = await queryConsignaDist({ id: 'd1' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
          Object {
            "distribuidor": Object {
              "consigna": Array [
                Object {
                  "fecha": "2018-03-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-03-04T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
              ],
              "email": "distr1@correo.com",
              "entregados": 11,
              "existencias": 8,
              "nombre": "Distrib 1",
            },
          }
        `);
    });

    test('distribuidor d1, last 3 consigna', async () => {
      const result = await queryConsignaDist({ id: 'd1', last: 3 });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
          Object {
            "distribuidor": Object {
              "consigna": Array [
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
              ],
              "email": "distr1@correo.com",
              "entregados": 11,
              "existencias": 8,
              "nombre": "Distrib 1",
            },
          }
        `);
      expect(result.data.distribuidor.consigna.length).toBe(3);
    });

    test('distribuidor d1, 2 items starting at 1', async () => {
      const result = await queryConsignaDist({ id: 'd1', offset: 1, limit: 2 });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
          Object {
            "distribuidor": Object {
              "consigna": Array [
                Object {
                  "fecha": "2018-03-04T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
                Object {
                  "fecha": "2018-05-03T23:00:00.000Z",
                  "vendedor": Object {
                    "nombre": "Usuario 1",
                  },
                },
              ],
              "email": "distr1@correo.com",
              "entregados": 11,
              "existencias": 8,
              "nombre": "Distrib 1",
            },
          }
        `);
      expect(result.data.distribuidor.consigna.length).toBe(2);
    });
  });

  describe('distribuidores', () => {
    const queryDistribuidores = getQuery<
      { offset?: number; limit?: number },
      { distribuidores: Distribuidor[] }
    >(gql`
      query($offset: Int, $limit: Int) {
        distribuidores(offset: $offset, limit: $limit) {
          nombre
          existencias
          entregados
        }
      }
    `);

    test('all distribuidores', async () => {
      const result = await queryDistribuidores({});
      expect(result.errors).toBeUndefined();
      expect(result.data.distribuidores.length).toBe(5);
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "distribuidores": Array [
            Object {
              "entregados": 11,
              "existencias": 8,
              "nombre": "Distrib 1",
            },
            Object {
              "entregados": 10,
              "existencias": 7,
              "nombre": "Distrib 2",
            },
            Object {
              "entregados": 0,
              "existencias": 0,
              "nombre": "Distrib 3",
            },
            Object {
              "entregados": 6,
              "existencias": 3,
              "nombre": "Distrib 4",
            },
            Object {
              "entregados": 0,
              "existencias": 0,
              "nombre": "Distrib 5",
            },
          ],
        }
      `);
    });

    test('2 distribuidores skipping 1', async () => {
      const result = await queryDistribuidores({ limit: 2, offset: 1 });
      expect(result.errors).toBeUndefined();
      expect(result.data.distribuidores.length).toBe(2);
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "distribuidores": Array [
            Object {
              "entregados": 10,
              "existencias": 7,
              "nombre": "Distrib 2",
            },
            Object {
              "entregados": 0,
              "existencias": 0,
              "nombre": "Distrib 3",
            },
          ],
        }
      `);
    });
  });

  describe('Mutations', () => {
    let id: ID;
    const distribuidor = {
      nombre: 'pepe',
      email: 'pepe@correo.com',
    };
    const otroNombre = 'pepito';

    describe('create', () => {
      const createDistribuidor = getMutation<
        Partial<Distribuidor>,
        {
          createDistribuidor: Distribuidor;
        }
      >(gql`
        mutation($nombre: String!, $email: String) {
          createDistribuidor(nombre: $nombre, email: $email) {
            id
            nombre
            email
          }
        }
      `);

      test('single distribuidor', async () => {
        const result = await createDistribuidor(distribuidor);
        expect(result.errors).toBeUndefined();
        const d = result.data.createDistribuidor;
        expect(d.nombre).toBe(distribuidor.nombre);
        expect(d.email).toBe(distribuidor.email);
        // eslint-disable-next-line prefer-destructuring
        id = d.id;

        const result1 = await distribuidorQuery({ id });
        expect(result1.errors).toBeUndefined();
        const d1 = result1.data.distribuidor;
        expect(d1.nombre).toBe(distribuidor.nombre);
        expect(d1.email).toBe(distribuidor.email);
      });

      test('duplicate distribuidor name', async () => {
        const result = await createDistribuidor(distribuidor);
        expect(result.errors?.length).toBe(1);
      });
    });

    describe('update', () => {
      const updateDistribuidor = getMutation<
        Partial<Distribuidor>,
        {
          updateDistribuidor: Distribuidor;
        }
      >(gql`
        mutation($id: ID!, $nombre: String, $email: String) {
          updateDistribuidor(id: $id, nombre: $nombre, email: $email) {
            id
            nombre
            email
          }
        }
      `);

      test('update pepe', async () => {
        const result = await updateDistribuidor({
          id,
          nombre: otroNombre,
        });
        expect(result.errors).toBeUndefined();
        const d = result.data.updateDistribuidor;
        expect(d.nombre).toBe(otroNombre);
        expect(d.email).toBe(distribuidor.email);

        const result1 = await distribuidorQuery({ id });
        expect(result1.errors).toBeUndefined();
        const d1 = result1.data.distribuidor;
        expect(d1.nombre).toBe(otroNombre);
        expect(d1.email).toBe(distribuidor.email);
      });

      test('fail to update distribuidor', async () => {
        const result = await updateDistribuidor({
          id: 'xxxx',
          nombre: otroNombre,
        });
        expect(result.errors?.length).toBe(1);
      });
    });

    describe('delete', () => {
      const deleteDistribuidor = getMutation<
        { id: ID },
        {
          deleteDistribuidor: Distribuidor;
        }
      >(gql`
        mutation($id: ID!) {
          deleteDistribuidor(id: $id) {
            id
            nombre
            email
          }
        }
      `);

      test('delete pepe', async () => {
        const result = await deleteDistribuidor({
          id,
        });
        expect(result.errors).toBeUndefined();
        const d = result.data.deleteDistribuidor;
        expect(d.nombre).toBe(otroNombre);
        expect(d.email).toBe(distribuidor.email);

        const result1 = await distribuidorQuery({ id });
        expect(result1.errors).toBeUndefined();
        expect(result1.data.distribuidor).toBeNull();
      });

      test('fail to delete distribuidor', async () => {
        const result = await deleteDistribuidor({
          id: 'xxxx',
        });
        expect(result.errors?.length).toBe(1);
      });
    });
  });
});
