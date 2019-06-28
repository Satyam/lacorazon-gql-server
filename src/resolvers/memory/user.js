import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { promisify } from 'util';

import {
  compareFecha,
  slice,
  getWithId,
  getAllLimitOffset,
  createWithId,
  updateWithId,
  deleteWithId,
  pickFields,
} from './utils';

const jwtSign = promisify(jwt.sign);
const jwtVerify = promisify(jwt.verify);

const safeFields = ['id', 'nombre', 'email'];

const oldCookie = res => {
  res.setHeader(
    'Set-Cookie',
    'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
};
export default {
  Query: {
    user: (parent, { id }, { data }) => getWithId(data.users, id, safeFields),
    users: (parent, args, { data }) =>
      getAllLimitOffset(data.users, args, safeFields),
    currentUser: (parent, args, { req }) => {
      const token = req.cookies.jwt;
      return token
        ? jwtVerify(token, process.env.JWT_SIGNATURE).then(values =>
            pickFields(values, safeFields)
          )
        : null;
    },
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
    login: (parent, { nombre, password }, { data, res }) => {
      const row = Object.values(data.users).find(u => u.nombre === nombre);
      if (row) {
        return verify(row.password, password).then(match => {
          if (match) {
            const user = getWithId(data.users, row.id, safeFields);
            return jwtSign(user, process.env.JWT_SIGNATURE, {
              expiresIn: process.env.JWT_EXPIRES,
              issuer: process.env.JWT_ISSUER,
            }).then(token => {
              res.setHeader(
                'Set-Cookie',
                `jwt=${token}; HttpOnly; path=${
                  process.env.GRAPHQL
                };  Max-Age=${ms(process.env.JWT_EXPIRES) / 1000}`
              );
              return user;
            });
          }
          oldCookie(res);
          return null;
        });
      }
      oldCookie(res);
      return null;
    },
    logout: (parent, args, { res }) => {
      oldCookie(res);
      return null;
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
