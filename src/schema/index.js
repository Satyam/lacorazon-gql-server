import { gql } from 'apollo-server-express';

import userSchema from './user';
import ventaSchema from './venta';

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

export default [linkSchema, userSchema, ventaSchema];
