import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { promisify } from 'util';

const jwtSign = promisify(jwt.sign);
const jwtVerify = promisify(jwt.verify);

export function invalidateToken(res) {
  res.setHeader(
    'Set-Cookie',
    `jwt=; HttpOnly; path=${process.env.GRAPHQL}; expires=${new Date(
      'January 1, 1970, 00:00:00 UTC'
    )}`
  );
  return null;
}

export function checkPassword(stored, entered) {
  return verify(stored, entered);
}

export function hashPassword(password) {
  return hash(password);
}

export function sendToken(user, res) {
  return jwtSign(user, process.env.JWT_SIGNATURE, {
    expiresIn: process.env.JWT_EXPIRES,
    issuer: process.env.JWT_ISSUER,
  }).then(token => {
    res.setHeader(
      'Set-Cookie',
      `jwt=${token}; HttpOnly; path=${process.env.GRAPHQL}; Max-Age=${ms(
        process.env.JWT_EXPIRES
      ) / 1000}`
    );
    return user;
  });
}

export function extractCurrentUser(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwtVerify(token, process.env.JWT_SIGNATURE).then(currentUser => {
      req.currentUser = currentUser;
      next();
    });
  } else {
    req.currentUser = null;
    next();
  }
}
