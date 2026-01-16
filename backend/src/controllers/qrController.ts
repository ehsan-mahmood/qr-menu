import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { query } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const createQrCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId, menuId, tableLabel, locationId } = req.body;

    if (!merchantId || !menuId) {
      sendError(res, 'BAD_REQUEST', 'merchantId and menuId are required', 400);
      return;
    }

    // Verify merchant ownership (merchantId must match the authenticated user's merchantId)
    if (merchantId !== req.user.userId) {
      sendError(res, 'FORBIDDEN', 'Merchant not found or access denied', 403);
      return;
    }

    const merchantResult = await query('SELECT id FROM merchants WHERE id = $1', [merchantId]);

    if (merchantResult.rows.length === 0) {
      sendError(res, 'FORBIDDEN', 'Merchant not found or access denied', 403);
      return;
    }

    // Verify menu exists and get location_id
    const menuResult = await query('SELECT id, location_id FROM menus WHERE id = $1 AND merchant_id = $2', [menuId, merchantId]);
    if (menuResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Menu not found', 404);
      return;
    }

    const menuLocationId = menuResult.rows[0].location_id || locationId;
    if (!menuLocationId) {
      sendError(res, 'BAD_REQUEST', 'Location is required for menu', 400);
      return;
    }

    const qrId = uuidv4();
    const qrToken = uuidv4();

    await query(
      `INSERT INTO table_qrs (id, location_id, menu_id, qr_token, table_label, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [qrId, menuLocationId, menuId, qrToken, tableLabel || null, true]
    );

    // Log QR creation event (events table only has merchant_id, event_type, menu_item_id, created_at)
    await query(
      `INSERT INTO events (id, merchant_id, event_type, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [uuidv4(), merchantId, 'qr_scan']
    );

    sendSuccess(
      res,
      'QR_CREATED',
      undefined,
      201,
      {
        qrCode: {
          qrToken,
          merchantId,
          menuId,
          locationId: menuLocationId,
          tableLabel: tableLabel || null,
          createdAt: new Date().toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Create QR code error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to create QR code', 500);
  }
};

export const getQrCodeData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { qrToken } = req.params;

    const qrResult = await query(
      `SELECT tqr.qr_token, tqr.menu_id, tqr.table_label, tqr.location_id, l.merchant_id
       FROM table_qrs tqr
       JOIN locations l ON tqr.location_id = l.id
       WHERE tqr.qr_token = $1`,
      [qrToken]
    );

    if (qrResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'QR code not found', 404);
      return;
    }

    const qr = qrResult.rows[0];

    sendSuccess(res, 'QR_DATA_RETRIEVED', {
      qrToken: qr.qr_token,
      merchantId: qr.merchant_id,
      menuId: qr.menu_id,
      locationId: qr.location_id,
      tableLabel: qr.table_label,
    });
  } catch (error: any) {
    console.error('Get QR code data error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve QR code data', 500);
  }
};

export const getMerchantQrCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId } = req.params;

    // Verify merchant ownership (merchantId must match the authenticated user's merchantId)
    if (merchantId !== req.user.userId) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    const merchantResult = await query('SELECT id FROM merchants WHERE id = $1', [merchantId]);

    if (merchantResult.rows.length === 0) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    const qrCodesResult = await query(
      `SELECT tqr.id, tqr.qr_token, tqr.table_label, tqr.menu_id, tqr.location_id, tqr.created_at,
              COALESCE(tqr.is_active, true) as is_active
       FROM table_qrs tqr
       JOIN locations l ON tqr.location_id = l.id
       WHERE l.merchant_id = $1
       ORDER BY tqr.created_at DESC`,
      [merchantId]
    );

    const qrCodes = qrCodesResult.rows.map((qr: any) => ({
      id: qr.id,
      qrToken: qr.qr_token,
      tableLabel: qr.table_label,
      menuId: qr.menu_id,
      locationId: qr.location_id,
      isActive: qr.is_active,
      createdAt: qr.created_at,
    }));

    sendSuccess(res, 'QR_CODES_RETRIEVED', qrCodes);
  } catch (error: any) {
    console.error('Get merchant QR codes error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve QR codes', 500);
  }
};

export const updateQrCodeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { qrId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      sendError(res, 'BAD_REQUEST', 'isActive must be a boolean', 400);
      return;
    }

    // Verify QR code belongs to merchant
    const qrResult = await query(
      `SELECT tqr.id FROM table_qrs tqr
       JOIN locations l ON tqr.location_id = l.id
       WHERE tqr.id = $1 AND l.merchant_id = $2`,
      [qrId, req.user.userId]
    );

    if (qrResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'QR code not found or access denied', 404);
      return;
    }

    await query(
      `UPDATE table_qrs SET is_active = $1 WHERE id = $2`,
      [isActive, qrId]
    );

    sendSuccess(res, 'QR_STATUS_UPDATED', { qrId, isActive });
  } catch (error: any) {
    console.error('Update QR code status error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to update QR code status', 500);
  }
};

export const registerPrePrintedQrCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId, menuId, qrToken, tableLabel, locationId } = req.body;

    if (!merchantId || !menuId || !qrToken) {
      sendError(res, 'BAD_REQUEST', 'merchantId, menuId, and qrToken are required', 400);
      return;
    }

    // Verify merchant ownership
    if (merchantId !== req.user.userId) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    // Check if QR token already exists
    const existingQr = await query('SELECT id FROM table_qrs WHERE qr_token = $1', [qrToken]);
    if (existingQr.rows.length > 0) {
      sendError(res, 'BAD_REQUEST', 'QR token already exists', 400);
      return;
    }

    // Verify menu exists and get location_id
    const menuResult = await query('SELECT id, location_id FROM menus WHERE id = $1 AND merchant_id = $2', [menuId, merchantId]);
    if (menuResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Menu not found', 404);
      return;
    }

    const menuLocationId = menuResult.rows[0].location_id || locationId;
    if (!menuLocationId) {
      sendError(res, 'BAD_REQUEST', 'Location is required for menu', 400);
      return;
    }

    const qrId = uuidv4();

    await query(
      `INSERT INTO table_qrs (id, location_id, menu_id, qr_token, table_label, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [qrId, menuLocationId, menuId, qrToken, tableLabel || null, true]
    );

    sendSuccess(
      res,
      'QR_REGISTERED',
      undefined,
      201,
      {
        qrCode: {
          id: qrId,
          qrToken,
          merchantId,
          menuId,
          locationId: menuLocationId,
          tableLabel: tableLabel || null,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Register pre-printed QR code error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to register QR code', 500);
  }
};

