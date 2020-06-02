import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    ventas(offset: Int, limit: Int, last: Int, idVendedor: ID): [Venta!]
    venta(id: ID!): Venta
  }
  extend type Mutation {
    createVenta(
      concepto: String!
      fecha: String!
      idVendedor: ID
      cantidad: Int
      precioUnitario: Float
      iva: Boolean
    ): Venta!
    updateVenta(
      id: ID!
      concepto: String
      fecha: String
      idVendedor: ID
      cantidad: Int
      precioUnitario: Float
      iva: Boolean
    ): Venta!
    deleteVenta(id: ID!): Venta!
  }

  type Venta {
    id: ID!
    concepto: String!
    fecha: String!
    vendedor: User
    cantidad: Int
    precioUnitario: Float
    iva: Boolean
  }
`;
