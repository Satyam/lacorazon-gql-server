import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import gqlFetch from './gqlfetch';
import dotenv from 'dotenv';
import { User } from '../resolvers';
dotenv.config({ path: '.env.tests' });

let server: ChildProcessWithoutNullStreams;

beforeAll(() => {
  return new Promise((resolve, reject) => {
    server = spawn('ts-node', ['--files', 'src/index.ts'], {
      env: {
        ...process.env,
        DATA_SOURCE: 'json',
      },
    });

    server.stdout.on('data', (data) => {
      // console.log(data.toString());
      if (
        data
          .toString()
          .includes(
            `Apollo Server on ${process.env.HOST}:${
              process.env.SERVER_PORT || 8000
            }${process.env.GRAPHQL}`
          )
      ) {
        // console.log('Server running.');
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    server.on('error', reject);
  });
});

describe('Integration test', () => {
  test('all Users', async () => {
    const result = await gqlFetch<{ users: User[] }>(`query {
      users {
        id
        nombre
      }
    }`)();
    expect(result.data).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "users": Array [
            Object {
              "id": "u1",
              "nombre": "Usuario 1",
            },
            Object {
              "id": "u2",
              "nombre": "Usuario 2",
            },
            Object {
              "id": "u3",
              "nombre": "Usuario 3",
            },
          ],
        },
      }
    `);
  });
});

afterAll(
  () =>
    new Promise((resolve, reject) => {
      server.on('exit', (code) => {
        if (code) {
          console.error(`Server exited with code ${code}`);
          reject();
        } else resolve();
      });
      server.kill();
    })
);
