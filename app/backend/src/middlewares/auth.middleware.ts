import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_URL_ISSUER = process.env.KEYCLOAK_URL_ISSUER;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
// Допустимые audience через запятую (Keycloak может отдавать aud: "ims_client" или "account" и т.д.)
const ALLOWED_AUDIENCES: string[] = (process.env.KEYCLOAK_CLIENT_ID_FE || 'ims_client')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// JWKS запрашиваем по URL issuer (публичный), чтобы совпадал hostname с сертификатом (ims-mts.ru, а не ims-keycloak)
const jwksUri = `${KEYCLOAK_URL_ISSUER}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;

const client = jwksClient({
  jwksUri,
  cache: true,
  cacheMaxAge: 600000, // 10 мин — ключи можно не запрашивать при каждой проверке
  rateLimit: true,
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

function isKeycloakUnreachable(err: Error): boolean {
  const msg = err?.message || '';
  return (
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('getaddrinfo')
  );
}

export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(
    token,
    getKey,
    { audience: ALLOWED_AUDIENCES.length > 0 ? ALLOWED_AUDIENCES : 'ims_client', issuer: `${KEYCLOAK_URL_ISSUER}/realms/${KEYCLOAK_REALM}` },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        if (isKeycloakUnreachable(err)) {
          return res.status(503).json({
            message: 'Keycloak недоступен. Запустите Keycloak и проверьте KEYCLOAK_URL_ISSUER (сейчас используется для JWKS: ' + jwksUri + ').',
            error: err.message,
          });
        }
        return res.status(401).json({ message: 'Invalid token', error: err.message });
      }
      req.user = decoded;
      next();
    }
  );
};