import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const JWT_REMEMBER_ME_EXPIRY = process.env.JWT_REMEMBER_ME_EXPIRY || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  merchantId?: string;
}

export const generateToken = (payload: JWTPayload, rememberMe: boolean = false): string => {
  const expiry = rememberMe ? JWT_REMEMBER_ME_EXPIRY : JWT_EXPIRY;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiry });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateReceivingId = (): string => {
  return uuidv4();
};

