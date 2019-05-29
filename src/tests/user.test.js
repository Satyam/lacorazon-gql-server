import gqlFetch from './gqlfetch';

describe('user', () => {
  describe('single user', () => {
    const query = gqlFetch(`
    query ($id: ID!) {
      user(id:$id) {
        nombre
        email
      }
    }
  `);
    test('user u1', () =>
      query({ id: 'u1' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                              Object {
                                "data": Object {
                                  "user": Object {
                                    "email": "usuario1@correo.com",
                                    "nombre": "Usuario 1",
                                  },
                                },
                              }
                        `);
      }));
    test('user u2', () =>
      query({ id: 'u2' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
          Object {
            "data": Object {
              "user": Object {
                "email": "usuario2@correo.com",
                "nombre": "Usuario 2",
              },
            },
          }
        `);
      }));
    test('user xxxx', () =>
      query({ id: 'xxxx' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                                                            Object {
                                                              "data": Object {
                                                                "user": null,
                                                              },
                                                            }
                                                `);
      }));
  });
  describe('single user with ventas', () => {
    const query = gqlFetch(`
    query ($id: ID!, $last: Int, $offset: Int, $limit: Int) {
      user(id:$id) {
        nombre
        email
        ventas(last:$last, offset: $offset, limit: $limit ) {
          concepto
          fecha
        }
      }
    }
  `);
    test('user u1, all ventas', () =>
      query({ id: 'u1' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                              Object {
                                "data": Object {
                                  "user": Object {
                                    "email": "usuario1@correo.com",
                                    "nombre": "Usuario 1",
                                    "ventas": Array [
                                      Object {
                                        "concepto": "1ra venta",
                                        "fecha": "2018-02-03T23:00:00.000Z",
                                      },
                                      Object {
                                        "concepto": "6ta venta",
                                        "fecha": "2018-10-03T23:00:00.000Z",
                                      },
                                      Object {
                                        "concepto": "7ma venta",
                                        "fecha": "2018-10-04T23:00:00.000Z",
                                      },
                                      Object {
                                        "concepto": "8va venta",
                                        "fecha": "2018-11-03T23:00:00.000Z",
                                      },
                                    ],
                                  },
                                },
                              }
                        `);
      }));
    test('user u1, last 3 ventas', () =>
      query({ id: 'u1', last: 3 }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                              Object {
                                "data": Object {
                                  "user": Object {
                                    "email": "usuario1@correo.com",
                                    "nombre": "Usuario 1",
                                    "ventas": Array [
                                      Object {
                                        "concepto": "6ta venta",
                                        "fecha": "2018-10-03T23:00:00.000Z",
                                      },
                                      Object {
                                        "concepto": "7ma venta",
                                        "fecha": "2018-10-04T23:00:00.000Z",
                                      },
                                      Object {
                                        "concepto": "8va venta",
                                        "fecha": "2018-11-03T23:00:00.000Z",
                                      },
                                    ],
                                  },
                                },
                              }
                        `);
        expect(result.data.data.user.ventas.length).toBe(3);
      }));
    test('user u1, 2 items starting at 1', () =>
      query({ id: 'u1', offset: 1, limit: 2 }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                              Object {
                                "data": Object {
                                  "user": Object {
                                    "email": "usuario1@correo.com",
                                    "nombre": "Usuario 1",
                                    "ventas": Array [
                                      Object {
                                        "concepto": "6ta venta",
                                        "fecha": "2018-10-03T23:00:00.000Z",
                                      },
                                      Object {
                                        "concepto": "7ma venta",
                                        "fecha": "2018-10-04T23:00:00.000Z",
                                      },
                                    ],
                                  },
                                },
                              }
                        `);
        expect(result.data.data.user.ventas.length).toBe(2);
      }));
  });
  describe('all users', () => {
    const query = gqlFetch(`
    query  {
      users {
        nombre
      }
    }
  `);
    test('all users', () =>
      query({}).then(result => {
        expect(result.data.data.users.length).toBe(3);
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
                        "users": Array [
                          Object {
                            "nombre": "Usuario 1",
                          },
                          Object {
                            "nombre": "Usuario 2",
                          },
                          Object {
                            "nombre": "Usuario 3",
                          },
                        ],
                      },
                    }
                `);
      }));
  });
});
