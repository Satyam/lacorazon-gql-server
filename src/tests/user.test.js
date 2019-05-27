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
    test('user ro', () =>
      query({ id: 'ro' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
                        "user": Object {
                          "email": "RoxanaCabut@gmail.com",
                          "nombre": "Roxana Cabut",
                        },
                      },
                    }
                `);
      }));
    test('user ra', () =>
      query({ id: 'ra' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
                        "user": Object {
                          "email": "reyezuelo@gmail.com",
                          "nombre": "Raed El Younsi",
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
    test('user ro, all ventas', () =>
      query({ id: 'ro' }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
                        "user": Object {
                          "email": "RoxanaCabut@gmail.com",
                          "nombre": "Roxana Cabut",
                          "ventas": Array [
                            Object {
                              "concepto": "Roxana desde 17/12/2017",
                              "fecha": "2018-09-30T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Roxana desde 17/12/2017",
                              "fecha": "2018-09-30T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Roxana desde 17/12/2017",
                              "fecha": "2018-09-30T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Sol (Río Abirto masajes)",
                              "fecha": "2018-10-03T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Roxy  para ella",
                              "fecha": "2018-10-07T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Manoli",
                              "fecha": "2018-10-19T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Laia (La Mano de Maya)",
                              "fecha": "2018-10-21T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Coco",
                              "fecha": "2018-10-21T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Machi (yoga compi)",
                              "fecha": "2018-11-05T23:00:00.000Z",
                            },
                            Object {
                              "concepto": "Ángela España Borja (Murcia)",
                              "fecha": "2018-11-13T23:00:00.000Z",
                            },
                          ],
                        },
                      },
                    }
                `);
      }));
    test('user ro, last 3 ventas', () =>
      query({ id: 'ro', last: 3 }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
                        "user": Object {
                          "email": "RoxanaCabut@gmail.com",
                          "nombre": "Roxana Cabut",
                          "ventas": Array [
                            Object {
                              "concepto": "Coco",
                              "fecha": "2018-10-21T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Machi (yoga compi)",
                              "fecha": "2018-11-05T23:00:00.000Z",
                            },
                            Object {
                              "concepto": "Ángela España Borja (Murcia)",
                              "fecha": "2018-11-13T23:00:00.000Z",
                            },
                          ],
                        },
                      },
                    }
                `);
        expect(result.data.data.user.ventas.length).toBe(3);
      }));
    test('user ro, 4 items starting at 2', () =>
      query({ id: 'ro', offset: 2, limit: 4 }).then(result => {
        expect(result.data).toMatchInlineSnapshot(`
                    Object {
                      "data": Object {
                        "user": Object {
                          "email": "RoxanaCabut@gmail.com",
                          "nombre": "Roxana Cabut",
                          "ventas": Array [
                            Object {
                              "concepto": "Roxana desde 17/12/2017",
                              "fecha": "2018-09-30T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Sol (Río Abirto masajes)",
                              "fecha": "2018-10-03T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Roxy  para ella",
                              "fecha": "2018-10-07T22:00:00.000Z",
                            },
                            Object {
                              "concepto": "Manoli",
                              "fecha": "2018-10-19T22:00:00.000Z",
                            },
                          ],
                        },
                      },
                    }
                `);
        expect(result.data.data.user.ventas.length).toBe(4);
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
                  "nombre": "Raed El Younsi",
                },
                Object {
                  "nombre": "Roxana & Raed",
                },
                Object {
                  "nombre": "Roxana Cabut",
                },
              ],
            },
          }
        `);
      }));
  });
});
