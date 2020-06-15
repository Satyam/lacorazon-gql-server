import gqlFetch from './gqlfetch';
import { Distribuidor, Consignacion } from '../resolvers';

describe('distribuidor', () => {
  const distribuidorQuery = gqlFetch<{ distribuidor: Distribuidor }>(`
    query ($id: ID!) {
      distribuidor(id:$id) {
        nombre
        email
      }
    }
  `);
  describe('single distribuidor', () => {
    test('distribuidor d1', () =>
      distribuidorQuery({ id: 'd1' }).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data).toMatchInlineSnapshot(`
                                        Object {
                                          "data": Object {
                                            "distribuidor": Object {
                                              "email": "distr1@correo.com",
                                              "nombre": "Distrib 1",
                                            },
                                          },
                                        }
                                `);
      }));
    test('distribuidor d2', () =>
      distribuidorQuery({ id: 'd2' }).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data).toMatchInlineSnapshot(`
                                        Object {
                                          "data": Object {
                                            "distribuidor": Object {
                                              "email": "distr2@correo.com",
                                              "nombre": "Distrib 2",
                                            },
                                          },
                                        }
                                `);
      }));
    test('distribuidor xxxx', () =>
      distribuidorQuery({ id: 'xxxx' }).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data).toMatchInlineSnapshot(`
                                        Object {
                                          "data": Object {
                                            "distribuidor": null,
                                          },
                                        }
                                `);
      }));
  });
  describe('single distribuidor with stock', () => {
    const query = gqlFetch<{
      distribuidor: Distribuidor & { consigna: Consignacion[] };
    }>(`
    query ($id: ID!, $last:Int, $offset: Int, $limit: Int ) {
      distribuidor(id:$id ) {
        nombre
        email
        entregados
        existencias
        consigna(last:$last, offset: $offset, limit: $limit ) {
          fecha
          vendedor {
            nombre
          }
        }
      }
    }
  `);
    test('distribuidor d1, all consigna', () =>
      query({ id: 'd1' }).then((result) => {
        console.log(JSON.stringify(result.data.errors, null, 2));
        expect(result.data.errors).toBeUndefined();
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
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
            },
          }
        `);
      }));
    test('distribuidor d1, last 3 consigna', () =>
      query({ id: 'd1', last: 3 }).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
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
            },
          }
        `);
        expect(result.data.data.distribuidor.consigna.length).toBe(3);
      }));
    test('distribuidor d1, 2 items starting at 1', () =>
      query({ id: 'd1', offset: 1, limit: 2 }).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
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
            },
          }
        `);
        expect(result.data.data.distribuidor.consigna.length).toBe(2);
      }));
  });
  describe('distribuidores', () => {
    const query = gqlFetch<{ distribuidores: Distribuidor[] }>(`
    query($offset: Int, $limit: Int )  {
      distribuidores(offset: $offset, limit: $limit ) {
        nombre
        existencias
        entregados
      }
    }
  `);
    test('all distribuidores', () =>
      query({}).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data.data.distribuidores.length).toBe(5);
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
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
            },
          }
        `);
      }));
    test('2 distribuidores skipping 1', () =>
      query({ limit: 2, offset: 1 }).then((result) => {
        expect(result.data.errors).toBeUndefined();
        expect(result.data.data.distribuidores.length).toBe(2);
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
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
                      },
                    }
                `);
      }));
  });
  describe('Mutations', () => {
    let id: ID;
    const distribuidor = {
      nombre: 'pepe',
      email: 'pepe@correo.com',
    };
    const otroNombre = 'pepito';
    describe('create', () => {
      const create = gqlFetch<{
        createDistribuidor: Distribuidor;
      }>(`mutation ($nombre: String!, $email: String) {
      createDistribuidor(nombre: $nombre, email: $email) {
        id
        nombre
        email
      }
    }
    `);
      test('single distribuidor', () =>
        create(distribuidor)
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const d = result.data.data.createDistribuidor;
            expect(d.nombre).toBe(distribuidor.nombre);
            expect(d.email).toBe(distribuidor.email);
            // eslint-disable-next-line prefer-destructuring
            id = d.id;
            return distribuidorQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const d = result.data.data.distribuidor;
            expect(d.nombre).toBe(distribuidor.nombre);
            expect(d.email).toBe(distribuidor.email);
          }));
      test('duplicate distribuidor name', () =>
        create(distribuidor).then((result) => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
    describe('update', () => {
      const update = gqlFetch<{
        updateDistribuidor: Distribuidor;
      }>(`mutation ($id: ID!, $nombre: String, $email: String) {
        updateDistribuidor(id: $id, nombre: $nombre, email: $email) {
          id
          nombre
          email
        }
      }`);
      test('update pepe', () =>
        update({
          id,
          nombre: otroNombre,
        })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const d = result.data.data.updateDistribuidor;
            expect(d.nombre).toBe(otroNombre);
            expect(d.email).toBe(distribuidor.email);
            return distribuidorQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const d = result.data.data.distribuidor;
            expect(d.nombre).toBe(otroNombre);
            expect(d.email).toBe(distribuidor.email);
          }));
      test('fail to update distribuidor', () =>
        update({
          id: 'xxxx',
          nombre: otroNombre,
        }).then((result) => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
    describe('delete', () => {
      const del = gqlFetch<{
        deleteDistribuidor: Distribuidor;
      }>(`mutation ($id: ID!) {
        deleteDistribuidor(id: $id) {
          id
          nombre
          email
        }
      }`);
      test('delete pepe', () =>
        del({
          id,
        })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const d = result.data.data.deleteDistribuidor;
            expect(d.nombre).toBe(otroNombre);
            expect(d.email).toBe(distribuidor.email);
            return distribuidorQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const d = result.data.data.distribuidor;
            expect(d).toBeNull();
          }));
      test('fail to delete distribuidor', () =>
        del({
          id: 'xxxx',
        }).then((result) => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
  });
});
