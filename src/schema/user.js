import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
  }

  extend type Mutation {
    createUser(nombre: String!, email: String, password: String!): User!
    updateUser(id: ID!, nombre: String, email: String, password: String): User!
    deleteUser(id: ID!): User!
    login(nombre: String!, password: String!): AuthPayload!
  }

  type User {
    id: ID!
    nombre: String!
    email: String
    ventas(offset: Int, limit: Int, last: Int): [Venta!]
  }

  type AuthPayload {
    token: String
    user: User
  }
`;
