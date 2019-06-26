import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import {
  compareFecha,
  slice,
  getWithId,
  getAllLimitOffset,
  createWithId,
  updateWithId,
  deleteWithId,
} from './utils';

const jwtSign = promisify(jwt.sign);

const safeFields = ['id', 'nombre', 'email'];

export default {
  Query: {
    user: (parent, { id }, { data }) => getWithId(data.users, id, safeFields),
    users: (parent, args, { data }) =>
      getAllLimitOffset(data.users, args, safeFields),
  },
  Mutation: {
    createUser: (parent, args, { data }) =>
      hash(args.password).then(password =>
        createWithId(data.users, { ...args, password }, safeFields)
      ),
    updateUser: (parent, args, { data }) => {
      if ('password' in args) {
        return hash(args.password).then(password =>
          updateWithId(data.users, { ...args, password }, safeFields)
        );
      }
      return updateWithId(data.users, args, safeFields);
    },
    deleteUser: (parent, { id }, { data }) =>
      deleteWithId(data.users, id, safeFields),
    login: (parent, { nombre, password }, { data }) => {
      const noLogin = {
        user: null,
        token: '',
      };
      const row = Object.values(data.users).find(u => u.nombre === nombre);
      if (row) {
        return verify(row.password, password).then(match => {
          if (match) {
            const user = getWithId(data.users, row.id, safeFields);
            return jwtSign(user, process.env.JWT_SIGNATURE, {
              expiresIn: process.env.JWT_EXPIRES,
              issuer: process.env.JWT_ISSUER,
            }).then(token => ({
              user,
              token,
            }));
          }
          return noLogin;
        });
      }
      return noLogin;
    },
  },
  User: {
    ventas: (parent, args, { data }) =>
      slice(
        Object.values(data.ventas)
          .filter(venta => venta.vendedor === parent.id)
          .sort(compareFecha),
        args
      ),
  },
};
