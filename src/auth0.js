const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const authConfig = {
  domain: 'dev-5ev0q6ua.eu.auth0.com',
  audience: 'https://lacorazon.es',
};

// Define middleware that validates incoming bearer tokens
// using JWKS from dev-5ev0q6ua.eu.auth0.com
export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ['RS256'],
});

export default checkJwt;
