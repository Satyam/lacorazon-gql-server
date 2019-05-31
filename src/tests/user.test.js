import gqlFetch from './gqlfetch';

describe('user', () => {
  const userQuery = gqlFetch(`
    query ($id: ID!) {
      user(id:$id) {
        nombre
        email
      }
    }
  `);
  describe('single user', () => {
    test('user u1', () =>
      userQuery({ id: 'u1' }).then(result => {
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
      userQuery({ id: 'u2' }).then(result => {
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
    test('user xxxx should return null', () =>
      userQuery({ id: 'xxxx' }).then(result => {
        expect(result.data.data.user).toBeNull();
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
  describe('Mutations', () => {
    let id;
    const usuario = {
      nombre: 'pepe',
      email: 'pepe@correo.com',
    };
    const otroNombre = 'pepito';
    describe('create', () => {
      const create = gqlFetch(`mutation ($nombre: String!, $email: String) {
      createUser(nombre: $nombre, email: $email) {
        id
        nombre
        email
      }
    }
    `);
      test('single user', () =>
        create(usuario)
          .then(result => {
            const u = result.data.data.createUser;
            expect(u.nombre).toBe(usuario.nombre);
            expect(u.email).toBe(usuario.email);
            // eslint-disable-next-line prefer-destructuring
            id = u.id;
            return userQuery({ id });
          })
          .then(result => {
            const u = result.data.data.user;
            expect(u.nombre).toBe(usuario.nombre);
            expect(u.email).toBe(usuario.email);
          }));
      test('duplicate user name', () =>
        create(usuario).then(result => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
    describe('update', () => {
      const update = gqlFetch(`mutation ($id: ID!, $nombre: String, $email: String) {
        updateUser(id: $id, nombre: $nombre, email: $email) {
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
          .then(result => {
            const u = result.data.data.updateUser;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
            return userQuery({ id });
          })
          .then(result => {
            const u = result.data.data.user;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
          }));
      test('fail to update user', () =>
        update({
          id: 'xxxx',
          nombre: otroNombre,
        }).then(result => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
    describe('delete', () => {
      const del = gqlFetch(`mutation ($id: ID!) {
        deleteUser(id: $id) {
          id
          nombre
          email
        }
      }`);
      test('delete pepe', () =>
        del({
          id,
        })
          .then(result => {
            const u = result.data.data.deleteUser;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
            return userQuery({ id });
          })
          .then(result => {
            const u = result.data.data.user;
            expect(u).toBeNull();
          }));
      test('fail to delete user', () =>
        del({
          id: 'xxxx',
        }).then(result => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
  });
});
