import { Response } from 'express';
import { query } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Get merchant custom domain
export const getCustomDomain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const merchantId = req.user.userId;

    const result = await query('SELECT custom_domain FROM merchants WHERE id = $1', [merchantId]);

    if (result.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Merchant not found', 404);
      return;
    }

    sendSuccess(res, 'CUSTOM_DOMAIN_RETRIEVED', {
      customDomain: result.rows[0].custom_domain || null,
    });
  } catch (error: any) {
    console.error('Get custom domain error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve custom domain', 500);
  }
};

// Update merchant custom domain
export const updateCustomDomain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { customDomain } = req.body;
    const merchantId = req.user.userId;

    // Validate custom domain format (optional - can be empty to clear)
    if (customDomain && customDomain.trim()) {
      const domain = customDomain.trim();
      // Basic validation - should be a valid domain format
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain) && !domain.includes('localhost')) {
        sendError(res, 'BAD_REQUEST', 'Invalid domain format', 400);
        return;
      }
    }

    await query(
      'UPDATE merchants SET custom_domain = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [customDomain && customDomain.trim() ? customDomain.trim() : null, merchantId]
    );

    sendSuccess(res, 'CUSTOM_DOMAIN_UPDATED', {
      customDomain: customDomain && customDomain.trim() ? customDomain.trim() : null,
    });
  } catch (error: any) {
    console.error('Update custom domain error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to update custom domain', 500);
  }
};

// Get merchant info by menu ID (for redirect logic) - Public route
export const getMerchantByMenuId = async (req: any, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;

    // Try both schema variations (UUID and VARCHAR)
    const result = await query(
      `SELECT m.custom_domain 
       FROM merchants m 
       INNER JOIN menus me ON m.id = me.merchant_id 
       WHERE me.id = $1`,
      [menuId]
    );

    if (result.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Menu not found', 404);
      return;
    }

    sendSuccess(res, 'MERCHANT_RETRIEVED', {
      customDomain: result.rows[0].custom_domain || null,
    });
  } catch (error: any) {
    console.error('Get merchant by menu ID error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve merchant', 500);
  }
};
