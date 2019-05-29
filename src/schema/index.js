import { gql } from 'apollo-server-express';

import userSchema from './user';
import ventaSchema from './venta';
import distribuidorSchema from './distribuidor';
import consignaSchema from './consigna';

const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [
  linkSchema,
  userSchema,
  ventaSchema,
  distribuidorSchema,
  consignaSchema,
];
