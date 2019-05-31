import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
  }

  extend type Mutation {
    createUser(nombre: String!, email: String): User!
    updateUser(id: ID!, nombre: String, email: String): User!
    deleteUser(id: ID!): User!
  }

  type User {
    id: ID!
    nombre: String!
    email: String
    ventas(offset: Int, limit: Int, last: Int): [Venta!]
  }
`;
