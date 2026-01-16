import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a payment for an order (optional, independent of order creation)
 * This is a simulation in demo mode, can be integrated with real payment gateways later
 */
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, amount, paymentMethod, metadata } = req.body;

    if (!orderId || !amount || !paymentMethod) {
      sendError(res, 'BAD_REQUEST', 'orderId, amount, and paymentMethod are required', 400);
      return;
    }

    // Verify order exists
    const orderResult = await query('SELECT id, total_cents FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Order not found', 404);
      return;
    }

    const order = orderResult.rows[0];
    const amountCents = Math.round(parseFloat(amount) * 100);
    const orderTotalCents = order.total_cents;

    // Validate payment amount (should match order total, but allow partial payments for flexibility)
    if (amountCents < 0) {
      sendError(res, 'BAD_REQUEST', 'Payment amount must be positive', 400);
      return;
    }

    const paymentId = uuidv4();
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Create payment record
      await client.query(
        `INSERT INTO payments (id, order_id, amount_cents, payment_method, payment_status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          paymentId,
          orderId,
          amountCents,
          paymentMethod,
          'completed', // In demo mode, simulate successful payment
          metadata ? JSON.stringify(metadata) : null,
        ]
      );

      // Generate a simulated transaction ID for demo mode
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await client.query('UPDATE payments SET transaction_id = $1 WHERE id = $2', [
        transactionId,
        paymentId,
      ]);

      await client.query('COMMIT');

      // Get payment record
      const paymentResult = await client.query(
        `SELECT * FROM payments WHERE id = $1`,
        [paymentId]
      );

      const payment = paymentResult.rows[0];

      sendSuccess(
        res,
        'PAYMENT_CREATED',
        undefined,
        201,
        {
          payment: {
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: payment.amount_cents / 100.0,
            paymentMethod: payment.payment_method,
            paymentStatus: payment.payment_status,
            transactionId: payment.transaction_id,
            metadata: payment.metadata ? JSON.parse(payment.metadata) : null,
            createdAt: payment.created_at,
          },
        }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Create payment error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to create payment', 500);
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const paymentResult = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);

    if (paymentResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Payment not found', 404);
      return;
    }

    const payment = paymentResult.rows[0];

    sendSuccess(res, 'PAYMENT_RETRIEVED', {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount_cents / 100.0,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      transactionId: payment.transaction_id,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : null,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    });
  } catch (error: any) {
    console.error('Get payment error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve payment', 500);
  }
};

/**
 * Get payments for an order
 */
export const getPaymentsByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const paymentsResult = await query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
      [orderId]
    );

    const payments = paymentsResult.rows.map((payment: any) => ({
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount_cents / 100.0,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      transactionId: payment.transaction_id,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : null,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    }));

    sendSuccess(res, 'PAYMENTS_RETRIEVED', payments);
  } catch (error: any) {
    console.error('Get payments by order error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve payments', 500);
  }
};

/**
 * Update payment status (for refunds, etc.)
 */
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { paymentId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      sendError(res, 'BAD_REQUEST', `Status must be one of: ${validStatuses.join(', ')}`, 400);
      return;
    }

    // Verify payment exists and get order info
    const paymentResult = await query(
      `SELECT p.*, l.merchant_id
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN table_qrs tqr ON o.table_qr_id = tqr.id
       JOIN locations l ON tqr.location_id = l.id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Payment not found', 404);
      return;
    }

    const merchantId = paymentResult.rows[0].merchant_id;

    // Verify merchant ownership
    if (merchantId !== req.user.userId) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    await query(
      'UPDATE payments SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [paymentStatus, paymentId]
    );

    sendSuccess(
      res,
      'PAYMENT_UPDATED',
      undefined,
      200,
      {
        paymentStatus,
      }
    );
  } catch (error: any) {
    console.error('Update payment status error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to update payment status', 500);
  }
};
