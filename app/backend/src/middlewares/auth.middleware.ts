import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_URL_ISSUER = process.env.KEYCLOAK_URL_ISSUER;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID_FE;

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    
    callback(null, signingKey);
  });
}

export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(
    token,
    getKey,
    { audience: CLIENT_ID, issuer: `${KEYCLOAK_URL_ISSUER}/realms/${KEYCLOAK_REALM}` },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res
          .status(401)
          .json({ message: 'Invalid token', error: err.message });
      }
      req.user = decoded; // Расширяем запрос данными пользователя
      next();
    }
  );
};