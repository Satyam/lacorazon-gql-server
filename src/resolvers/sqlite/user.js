import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { promisify } from 'util';

import {
  getWithId,
  getAllLimitOffset,
  createWithId,
  updateWithId,
  deleteWithId,
} from './utils';

import { pickFields } from '../memory/utils';

const jwtSign = promisify(jwt.sign);
const jwtVerify = promisify(jwt.verify);

const oldCookie = res => {
  res.setHeader(
    'Set-Cookie',
    'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
};

const TABLE = 'Users';

const safeFields = ['id', 'nombre', 'email'];
export default {
  Query: {
    user: (parent, { id }, { db }) => getWithId(TABLE, id, db, safeFields),
    users: (parent, args, { db }) =>
      getAllLimitOffset(TABLE, args, db, safeFields),
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
    createUser: (parent, args, { db }) =>
      hash(args.password).then(password =>
        createWithId(TABLE, { ...args, password }, db, safeFields)
      ),
    updateUser: (parent, args, { db }) => {
      if ('password' in args) {
        return hash(args.password).then(password =>
          updateWithId(TABLE, { ...args, password }, db, safeFields)
        );
      }
      return updateWithId(TABLE, args, db, safeFields);
    },
    deleteUser: (parent, { id }, { db }) =>
      deleteWithId(TABLE, id, db, safeFields),
    login: (parent, { nombre, password }, { db, res }) =>
      db
        .get('select id, password from Users where nombre = ?', [nombre])
        .then(row => {
          if (row) {
            return verify(row.password, password).then(match => {
              if (match) {
                return getWithId(TABLE, row.id, db, safeFields).then(user =>
                  jwtSign(user, process.env.JWT_SIGNATURE, {
                    expiresIn: process.env.JWT_EXPIRES,
                    issuer: process.env.JWT_ISSUER,
                  }).then(token => {
                    res.setHeader(
                      'Set-Cookie',
                      `jwt=${token}; HttpOnly; path=${
                        process.env.GRAPHQL
                      }; Max-Age=${ms(process.env.JWT_EXPIRES) / 1000}`
                    );
                    return user;
                  })
                );
              }
              oldCookie(res);
              return null;
            });
          }
          oldCookie(res);
          return null;
        }),
    logout: (parent, args, { res }) => {
      oldCookie(res);
      return null;
    },
  },
  User: {
    ventas: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Ventas where vendedor = $vendedor order by fecha desc, id desc limit $last',
            {
              $vendedor: parent.id,
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Ventas where vendedor = $vendedor order by fecha, id limit $limit offset $offset',
          {
            $vendedor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Ventas where vendedor = $vendedor order by fecha, id',
        {
          $vendedor: parent.id,
        }
      );
    },
  },
};
