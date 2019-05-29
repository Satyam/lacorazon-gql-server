import gqlFetch from './gqlfetch';

describe('distribuidor', () => {
  describe('single distribuidor', () => {
    const query = gqlFetch(`
    query ($id: ID!) {
      distribuidor(id:$id) {
        nombre
        email
      }
    }
  `);
    test('distribuidor d1', () =>
      query({ id: 'd1' }).then(result => {
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
      query({ id: 'd2' }).then(result => {
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
      query({ id: 'xxxx' }).then(result => {
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
    const query = gqlFetch(`
    query ($id: ID!, $last:Int, $offset: Int, $limit: Int ) {
      distribuidor(id:$id ) {
        nombre
        email
        entregados
        existencias
        consigna(last:$last, offset: $offset, limit: $limit ) {
          fecha
          vendedor
        }
      }
    }
  `);
    test('distribuidor d1, all consigna', () =>
      query({ id: 'd1' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "distribuidor": Object {
                "consigna": Array [
                  Object {
                    "fecha": "2018-03-03T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-03-04T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
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
      query({ id: 'd1', last: 3 }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "distribuidor": Object {
                "consigna": Array [
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
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
      query({ id: 'd1', offset: 1, limit: 2 }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "distribuidor": Object {
                "consigna": Array [
                  Object {
                    "fecha": "2018-03-04T23:00:00.000Z",
                    "vendedor": "u1",
                  },
                  Object {
                    "fecha": "2018-05-03T23:00:00.000Z",
                    "vendedor": "u1",
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
    const query = gqlFetch(`
    query($offset: Int, $limit: Int )  {
      distribuidores(offset: $offset, limit: $limit ) {
        nombre
        existencias
        entregados
      }
    }
  `);
    test('all distribuidores', () =>
      query({}).then(result => {
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
                  "entregados": 0,
                  "existencias": 0,
                  "nombre": "Distrib 4",
                },
                Object {
                  "entregados": 6,
                  "existencias": 3,
                  "nombre": "Distrib 5",
                },
              ],
            },
          }
        `);
      }));
    test('2 distribuidores skipping 1', () =>
      query({ limit: 2, offset: 1 }).then(result => {
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
});
