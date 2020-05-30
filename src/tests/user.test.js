import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import gqlFetch from './gqlfetch';

dotenv.config({ path: '.env.tests' });
dotenv.config();

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
      userQuery({ id: 'u1' }).then((result) => {
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
      userQuery({ id: 'u2' }).then((result) => {
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
      userQuery({ id: 'xxxx' }).then((result) => {
        expect(result.data.errors).toBeUndefined();
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
      query({ id: 'u1' }).then((result) => {
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
      query({ id: 'u1', last: 3 }).then((result) => {
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
      query({ id: 'u1', offset: 1, limit: 2 }).then((result) => {
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
      query({}).then((result) => {
        expect(result.data.errors).toBeUndefined();

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
      password: 'pepito',
    };
    const otroNombre = 'pepito';
    const otroPassword = 'pepitito';
    describe('create', () => {
      const create = gqlFetch(`mutation ($nombre: String!, $email: String, $password: String!) {
      createUser(nombre: $nombre, email: $email, password: $password) {
        id
        nombre
        email
      }
    }
    `);
      test('single user', () => {
        return create(usuario)
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.createUser;
            expect(u.nombre).toBe(usuario.nombre);
            expect(u.email).toBe(usuario.email);
            // eslint-disable-next-line prefer-destructuring
            id = u.id;
            return userQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.user;
            expect(u.nombre).toBe(usuario.nombre);
            expect(u.email).toBe(usuario.email);
          });
      });
      test('duplicate user name', () =>
        create(usuario).then((result) => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
    // Since switching to Auth0, login is remote
    describe.skip('login', () => {
      const login = gqlFetch(`mutation ($nombre: String!, $password: String!) {
        login(nombre: $nombre, password: $password) {
          id
          nombre
          email
        }
      }`);
      const currentUser = gqlFetch(`query {
        currentUser {
          nombre
          email
        }
      }`);
      const logout = gqlFetch(`mutation { 
        logout
      }`);
      const jwtMatch = /^jwt=([^;]*)/;

      test('pepe with correct password', () =>
        login({ nombre: usuario.nombre, password: usuario.password }).then(
          (result) => {
            expect(result.data.errors).toBeUndefined();
            // eslint-disable-next-line no-shadow
            const { login } = result.data.data;
            expect(login.nombre).toBe(usuario.nombre);
            expect(login.email).toBe(usuario.email);
            const token = result.headers['set-cookie'].find((ck) =>
              jwtMatch.test(ck)
            );
            const m = jwtMatch.exec(token);
            expect(m).not.toBeNull();
            const webToken = m[1];
            const user = jwt.verify(webToken, process.env.JWT_SIGNATURE);
            expect(user.nombre).toBe(usuario.nombre);
            expect(user.email).toBe(usuario.email);
          }
        ));

      test('current user', () =>
        currentUser(null, {
          headers: {
            Cookie: `jwt=${jwt.sign(
              usuario,
              process.env.JWT_SIGNATURE
            )};HttpOnly`,
          },
        }).then((result) => {
          expect(result.data.errors).toBeUndefined();
          // eslint-disable-next-line no-shadow
          const { currentUser } = result.data.data;
          expect(currentUser.nombre).toBe(usuario.nombre);
          expect(currentUser.email).toBe(usuario.email);
        }));
      test('logout', () =>
        logout(null).then((result) => {
          expect(result.data.errors).toBeUndefined();
          expect(result.data.data.logout).toBeNull();
          const token = result.headers['set-cookie'].find((ck) =>
            jwtMatch.test(ck)
          );
          const m = jwtMatch.exec(token);
          expect(m).not.toBeNull();
          expect(m[1]).toBeFalsy();
          const exp = token
            .split(';')
            .find((opt) => opt.trim().startsWith('expires='));
          expect(exp).not.toBeUndefined();

          expect(new Date(exp.split('=')[1]).toISOString()).toBe(
            '1970-01-01T00:00:00.000Z'
          );
        }));
      test('pepe with wrong password', () =>
        login({ nombre: usuario.nombre, password: 'xxxx' }).then((result) => {
          expect(result.data.errors).toBeUndefined();
          // eslint-disable-next-line no-shadow
          const { login } = result.data.data;
          expect(login).toBeNull();
        }));
      test('wrong user', () =>
        login({ nombre: 'xxxx', password: usuario.password }).then((result) => {
          expect(result.data.errors).toBeUndefined();
          // eslint-disable-next-line no-shadow
          const { login } = result.data.data;
          expect(login).toBeNull();
        }));
    });
    describe('update', () => {
      const update = gqlFetch(`mutation ($id: ID!, $nombre: String, $email: String, $password: String) {
        updateUser(id: $id, nombre: $nombre, email: $email, password: $password) {
          id
          nombre
          email
        }
      }`);
      test('update nombre de pepe', () =>
        update({
          id,
          nombre: otroNombre,
        })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.updateUser;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
            return userQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.user;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
          }));
      test('update password de pepe', () =>
        update({
          id,
          password: otroPassword,
        })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.updateUser;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
            return userQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.user;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
          }));
      test('fail to update user', () =>
        update({
          id: 'xxxx',
          nombre: otroNombre,
        }).then((result) => {
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
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.deleteUser;
            expect(u.nombre).toBe(otroNombre);
            expect(u.email).toBe(usuario.email);
            return userQuery({ id });
          })
          .then((result) => {
            expect(result.data.errors).toBeUndefined();
            const u = result.data.data.user;
            expect(u).toBeNull();
          }));
      test('fail to delete user', () =>
        del({
          id: 'xxxx',
        }).then((result) => {
          expect(result.data.errors.length).toBe(1);
        }));
    });
  });
});
