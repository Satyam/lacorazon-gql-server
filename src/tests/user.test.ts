/* eslint-disable jest/no-commented-out-tests */
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
import { gql } from 'apollo-server';
import {
  getQuery,
  initTestClient,
  getMutation,
  killPrisma,
} from './getApolloTestServer';

import type { User, Venta } from '../resolvers';

// dotenv.config({ path: '.env.tests' });
// dotenv.config();

beforeAll(initTestClient);
afterAll(killPrisma);

describe('user', () => {
  const userQuery = getQuery<{ user: User }, { id: ID }>(gql`
    query($id: ID!) {
      user(id: $id) {
        nombre
        email
      }
    }
  `);

  describe('single user', () => {
    test('user u1', async () => {
      const result = await userQuery({ id: 'u1' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "user": Object {
            "email": "usuario1@correo.com",
            "nombre": "Usuario 1",
          },
        }
      `);
    });

    test('user u2', async () => {
      const result = await userQuery({ id: 'u2' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "user": Object {
            "email": "usuario2@correo.com",
            "nombre": "Usuario 2",
          },
        }
      `);
    });

    test('user xxxx should return null', async () => {
      const result = await userQuery({ id: 'xxxx' });
      expect(result.errors).toBeUndefined();
      expect(result.data.user).toBeNull();
    });
  });

  describe('single user with ventas', () => {
    const userWithVentas = getQuery<
      { user: User & { ventas: Venta[] } },
      { id: ID; last?: number; offset?: number; limit?: number }
    >(gql`
      query($id: ID!, $last: Int, $offset: Int, $limit: Int) {
        user(id: $id) {
          nombre
          email
          ventas(last: $last, offset: $offset, limit: $limit) {
            concepto
            fecha
          }
        }
      }
    `);

    test('user u1, all ventas', async () => {
      const result = await userWithVentas({ id: 'u1' });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
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
        }
      `);
    });

    test('user u1, last 3 ventas', async () => {
      const result = await userWithVentas({ id: 'u1', last: 3 });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
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
        }
      `);
      expect(result.data.user.ventas.length).toBe(3);
    });

    test('user u1, 2 items starting at 1', async () => {
      const result = await userWithVentas({ id: 'u1', offset: 1, limit: 2 });
      expect(result.errors).toBeUndefined();
      expect(result.data).toMatchInlineSnapshot(`
        Object {
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
        }
      `);
      expect(result.data.user.ventas.length).toBe(2);
    });
  });

  describe('all users', () => {
    const allUsers = getQuery<{ users: User[] }>(gql`
      query {
        users {
          nombre
        }
      }
    `);

    test('all users', async () => {
      const result = await allUsers();
      expect(result.errors).toBeUndefined();

      expect(result.data.users.length).toBe(3);
      expect(result.data).toMatchInlineSnapshot(`
          Object {
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
          }
        `);
    });
  });

  describe('Mutations', () => {
    let id: ID;
    const usuario = {
      nombre: 'pepe',
      email: 'pepe@correo.com',
      password: 'pepito',
    };
    const otroNombre = 'pepito';
    const otroPassword = 'pepitito';

    describe('create', () => {
      const createUser = getMutation<
        Partial<User>,
        {
          createUser: User;
        }
      >(gql`
        mutation($nombre: String!, $email: String, $password: String!) {
          createUser(nombre: $nombre, email: $email, password: $password) {
            id
            nombre
            email
          }
        }
      `);
      test('single user', async () => {
        const result = await createUser(usuario);
        expect(result.errors).toBeUndefined();
        const u = result.data.createUser;
        expect(u.nombre).toBe(usuario.nombre);
        expect(u.email).toBe(usuario.email);
        // eslint-disable-next-line prefer-destructuring
        id = u.id;

        const result1 = await userQuery({ id });
        expect(result1.errors).toBeUndefined();
        const u1 = result1.data.user;
        expect(u1.nombre).toBe(usuario.nombre);
        expect(u1.email).toBe(usuario.email);
      });

      test('duplicate user name', async () => {
        const result = await createUser(usuario);
        expect(result.errors?.length).toBe(1);
      });
    });

    // Since switching to Auth0, login is remote
    // eslint-disable jest/no-commented-out-tests
    // describe.skip('login', () => {
    //   const login = gqlFetch<{
    //     login: User;
    //   }>(`mutation ($nombre: String!, $password: String!) {
    //     login(nombre: $nombre, password: $password) {
    //       id
    //       nombre
    //       email
    //     }
    //   }`);
    //   const currentUser = gqlFetch<{ currentUser: User }>(`query {
    //     currentUser {
    //       nombre
    //       email
    //     }
    //   }`);
    //   const logout = gqlFetch<{ logout: null }>(`mutation {
    //     logout
    //   }`);
    //   const jwtMatch = /^jwt=([^;]*)/;
    //   const jwtSignature = process.env.JWT_SIGNATURE || '';
    //   test('pepe with correct password', () =>
    //     login({ nombre: usuario.nombre, password: usuario.password }).then(
    //       (result) => {
    //         expect(result.data.errors).toBeUndefined();
    //         // eslint-disable-next-line no-shadow
    //         const { login } = result.data.data;
    //         expect(login.nombre).toBe(usuario.nombre);
    //         expect(login.email).toBe(usuario.email);
    //         const token = result.headers['set-cookie'].find((ck: string) =>
    //           jwtMatch.test(ck)
    //         );
    //         const m = jwtMatch.exec(token);
    //         expect(m).not.toBeNull();
    //         const webToken = m ? m[1] : '';
    //         const user = jwt.verify(webToken, jwtSignature);
    //         expect((<User>user).nombre).toBe(usuario.nombre);
    //         expect((<User>user).email).toBe(usuario.email);
    //       }
    //     ));

    //   test('current user', () =>
    //     currentUser(null, {
    //       headers: {
    //         Cookie: `jwt=${jwt.sign(usuario, jwtSignature)};HttpOnly`,
    //       },
    //     }).then((result) => {
    //       expect(result.data.errors).toBeUndefined();
    //       // eslint-disable-next-line no-shadow
    //       const { currentUser } = result.data.data;
    //       expect(currentUser.nombre).toBe(usuario.nombre);
    //       expect(currentUser.email).toBe(usuario.email);
    //     }));
    //   test('logout', () =>
    //     logout(null).then((result) => {
    //       expect(result.data.errors).toBeUndefined();
    //       expect(result.data.data.logout).toBeNull();
    //       const token = result.headers['set-cookie'].find((ck: string) =>
    //         jwtMatch.test(ck)
    //       );
    //       const m = jwtMatch.exec(token);
    //       expect(m).not.toBeNull();
    //       if (m) {
    //         expect(m[1]).toBeFalsy();
    //         const exp = token
    //           .split(';')
    //           .find((opt: string) => opt.trim().startsWith('expires='));
    //         expect(exp).not.toBeUndefined();

    //         expect(new Date(exp.split('=')[1]).toISOString()).toBe(
    //           '1970-01-01T00:00:00.000Z'
    //         );
    //       }
    //     }));
    //   test('pepe with wrong password', () =>
    //     login({ nombre: usuario.nombre, password: 'xxxx' }).then((result) => {
    //       expect(result.data.errors).toBeUndefined();
    //       // eslint-disable-next-line no-shadow
    //       const { login } = result.data.data;
    //       expect(login).toBeNull();
    //     }));
    //   test('wrong user', () =>
    //     login({ nombre: 'xxxx', password: usuario.password }).then((result) => {
    //       expect(result.data.errors).toBeUndefined();
    //       // eslint-disable-next-line no-shadow
    //       const { login } = result.data.data;
    //       expect(login).toBeNull();
    //     }));
    // });
    // eslint-enable jest/no-commented-out-tests

    describe('update', () => {
      const updateUser = getMutation<
        Partial<User>,
        {
          updateUser: User;
        }
      >(gql`
        mutation($id: ID!, $nombre: String, $email: String, $password: String) {
          updateUser(
            id: $id
            nombre: $nombre
            email: $email
            password: $password
          ) {
            id
            nombre
            email
          }
        }
      `);

      test('update nombre de pepe', async () => {
        const result = await updateUser({
          id,
          nombre: otroNombre,
        });
        expect(result.errors).toBeUndefined();
        const u = result.data.updateUser;
        expect(u.nombre).toBe(otroNombre);
        expect(u.email).toBe(usuario.email);

        const result1 = await userQuery({ id });
        expect(result1.errors).toBeUndefined();
        const u1 = result1.data.user;
        expect(u1.nombre).toBe(otroNombre);
        expect(u1.email).toBe(usuario.email);
      });

      test('update password de pepe', async () => {
        const result = await updateUser({
          id,
          password: otroPassword,
        });
        expect(result.errors).toBeUndefined();
        const u = result.data.updateUser;
        expect(u.nombre).toBe(otroNombre);
        expect(u.email).toBe(usuario.email);

        const result1 = await userQuery({ id });
        expect(result1.errors).toBeUndefined();
        const u1 = result1.data.user;
        expect(u1.nombre).toBe(otroNombre);
        expect(u1.email).toBe(usuario.email);
      });

      test('fail to update user', async () => {
        const result = await updateUser({
          id: 'xxxx',
          nombre: otroNombre,
        });
        expect(result.errors?.length).toBe(1);
      });
    });

    describe('delete', () => {
      const deleteUser = getMutation<{ id: ID }, { deleteUser: User }>(gql`
        mutation($id: ID!) {
          deleteUser(id: $id) {
            id
            nombre
            email
          }
        }
      `);

      test('delete pepe', async () => {
        const result = await deleteUser({
          id,
        });
        expect(result.errors).toBeUndefined();
        const u = result.data.deleteUser;
        expect(u.nombre).toBe(otroNombre);
        expect(u.email).toBe(usuario.email);

        const result1 = await userQuery({ id });
        expect(result1.errors).toBeUndefined();
        const u1 = result1.data.user;
        expect(u1).toBeNull();
      });

      test('fail to delete user', async () => {
        const result = await deleteUser({ id: 'xxxx' });
        expect(result.errors?.length).toBe(1);
      });
    });
  });
});
