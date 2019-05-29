import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    distribuidores(offset: Int, limit: Int, last: Int): [Distribuidor!]
    distribuidor(id: ID!): Distribuidor
  }

  type Distribuidor {
    id: ID!
    nombre: String!
    localidad: String
    contacto: String
    telefono: String
    email: String
    direccion: String
    entregados: Int
    existencias: Int
    consigna(offset: Int, limit: Int, last: Int): [Consigna!]
  }
`;
