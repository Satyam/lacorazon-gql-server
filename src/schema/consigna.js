import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    consignas(offset: Int, limit: Int, last: Int): [Consigna!]
    consigna(id: ID!): Consigna
  }

  type Consigna {
    id: ID!
    fecha: String
    distribuidor: String
    vendedor: String
    entregados: Int
    porcentaje: Float
    vendidos: Int
    devueltos: Int
    cobrado: Float
    iva: Boolean
    comentarios: String
  }
`;
