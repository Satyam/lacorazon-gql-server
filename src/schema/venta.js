import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    ventas: [Venta!]
    venta(id: ID!): Venta
  }

  type Venta {
    id: ID!
    concepto: String!
    fecha: String
    vendedor: User
    cantidad: Int
    precioUnitario: Float
  }
`;
