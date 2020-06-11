import { createTestClient } from 'apollo-server-testing';
import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server';
import getApolloTestServer from './getApolloTestServer';

let server: ApolloServer;

beforeAll(async () => {
  return (server = await getApolloTestServer());
});

it('query distribuidor d1', async () => {
  const { query } = createTestClient(server);
  const res = await query({
    query: gql`
      query($id: ID!) {
        distribuidor(id: $id) {
          nombre
          email
        }
      }
    `,
    variables: { id: 'd1' },
  });
  expect(res.data).toMatchInlineSnapshot(`
    Object {
      "distribuidor": Object {
        "email": "distr1@correo.com",
        "nombre": "Distrib 1",
      },
    }
  `);
});
