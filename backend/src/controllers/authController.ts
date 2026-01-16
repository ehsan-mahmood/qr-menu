import { Response } from 'express';
import { query } from '../db/connection';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      sendError(res, 'BAD_REQUEST', 'Email and password are required', 400);
      return;
    }

    const merchantResult = await query(
      'SELECT * FROM merchants WHERE email = $1',
      [email]
    );

    if (merchantResult.rows.length === 0) {
      sendError(res, 'UNAUTHORIZED', 'Invalid credentials', 401);
      return;
    }

    const merchant = merchantResult.rows[0];
    
    if (!merchant.password_hash) {
      sendError(res, 'UNAUTHORIZED', 'Invalid credentials', 401);
      return;
    }

    const isValidPassword = await comparePassword(password, merchant.password_hash);

    if (!isValidPassword) {
      sendError(res, 'UNAUTHORIZED', 'Invalid credentials', 401);
      return;
    }

    const token = generateToken(
      {
        userId: merchant.id,
        email: merchant.email,
        merchantId: merchant.id,
      },
      rememberMe
    );

    sendSuccess(
      res,
      'LOGIN_SUCCESS',
      undefined,
      200,
      {
        token,
        user: {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          merchantId: merchant.id,
          phone: merchant.phone || null,
        },
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Login failed', 500);
  }
};

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'BAD_REQUEST', 'Name, email, and password are required', 400);
      return;
    }

    if (password.length < 6) {
      sendError(res, 'BAD_REQUEST', 'Password must be at least 6 characters', 400);
      return;
    }

    // Check if email already exists
    const existingMerchant = await query('SELECT id FROM merchants WHERE email = $1', [email]);
    if (existingMerchant.rows.length > 0) {
      sendError(res, 'CONFLICT', 'Email already exists', 409);
      return;
    }

    const passwordHash = await hashPassword(password);

    // Create merchant (ID will be auto-generated as UUID)
    const result = await query(
      'INSERT INTO merchants (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, passwordHash, phone || null]
    );

    const merchantId = result.rows[0].id;

    const token = generateToken({
      userId: merchantId,
      email,
      merchantId,
    });

    sendSuccess(
      res,
      'SIGNUP_SUCCESS',
      undefined,
      201,
      {
        token,
        user: {
          id: merchantId,
          name,
          email,
          phone: phone || null,
          merchantId,
        },
      }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === '23505') {
      sendError(res, 'CONFLICT', 'Email already exists', 409);
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Signup failed', 500);
    }
  }
};

export const verify = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Invalid token', 401);
      return;
    }

    const merchantResult = await query(
      'SELECT * FROM merchants WHERE id = $1',
      [req.user.userId]
    );

    if (merchantResult.rows.length === 0) {
      sendError(res, 'UNAUTHORIZED', 'User not found', 401);
      return;
    }

    const merchant = merchantResult.rows[0];

    sendSuccess(
      res,
      'TOKEN_VALID',
      undefined,
      200,
      {
        user: {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          merchantId: merchant.id,
        },
      }
    );
  } catch (error: any) {
    console.error('Verify error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Token verification failed', 500);
  }
};

