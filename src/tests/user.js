// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';

const API_URL = 'http://localhost:8000/graphql';

function fetch(query, variables) {
  return axios.post(API_URL, { query, variables });
}

describe('user', () => {
  test('user(id:"ro") { nombre email }', () =>
    fetch(
      `
      query ($id: ID!) {
        user(id:$id) {
          nombre
          email
        }
      }
    `,
      { id: 'ro' }
    ).then(result => {
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
  test('user(id:"ra") { nombre email }', () =>
    fetch(
      `
      query ($id: ID!) {
        user(id:$id) {
          nombre
          email
        }
      }
    `,
      { id: 'ra' }
    ).then(result => {
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
  test('user(id:"xxxx") { nombre email }', () =>
    fetch(
      `
      query ($id: ID!) {
        user(id:$id) {
          nombre
          email
        }
      }
    `,
      { id: 'xxxx' }
    ).then(result => {
      expect(result.data).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "user": null,
          },
        }
      `);
    }));
});
