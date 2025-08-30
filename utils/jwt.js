import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function signJwt(payload, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (_) {
    return null;
  }
}
