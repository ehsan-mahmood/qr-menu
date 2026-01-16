import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tableQrId, items, totalAmount, status } = req.body;

    if (!tableQrId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      sendError(res, 'BAD_REQUEST', 'tableQrId, items, and totalAmount are required', 400);
      return;
    }

    // Verify table_qr exists
    const qrResult = await query('SELECT id, menu_id FROM table_qrs WHERE id = $1', [tableQrId]);
    if (qrResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Table QR not found', 404);
      return;
    }

    const orderId = uuidv4();
    const totalCents = Math.round(parseFloat(totalAmount) * 100);
    const orderStatus = status || 'draft';

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Create order
      await client.query(
        `INSERT INTO orders (id, table_qr_id, status, total_cents)
         VALUES ($1, $2, $3, $4)`,
        [orderId, tableQrId, orderStatus, totalCents]
      );

      // Create order items
      for (const item of items) {
        const orderItemId = uuidv4();
        const itemPriceCents = Math.round(parseFloat(item.price) * 100);
        
        await client.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, quantity, price_cents)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderItemId, orderId, item.itemId || item.menu_item_id, item.quantity || 1, itemPriceCents]
        );
      }

      await client.query('COMMIT');

      // Get order with items for response
      const orderResult = await client.query(
        `SELECT o.*, 
         json_agg(
           json_build_object(
             'id', oi.id,
             'menu_item_id', oi.menu_item_id,
             'quantity', oi.quantity,
             'price_cents', oi.price_cents
           )
         ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = $1
         GROUP BY o.id`,
        [orderId]
      );

      const order = orderResult.rows[0];

      sendSuccess(
        res,
        'ORDER_CREATED',
        undefined,
        201,
        {
          order: {
            orderId: order.id,
            tableQrId: order.table_qr_id,
            status: order.status,
            totalAmount: order.total_cents / 100.0,
            items: order.items || [],
            createdAt: order.created_at,
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
    console.error('Create order error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to create order', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const orderResult = await query(
      `SELECT o.*, 
       json_agg(
         json_build_object(
           'id', oi.id,
           'menu_item_id', oi.menu_item_id,
           'quantity', oi.quantity,
           'price_cents', oi.price_cents
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Order not found', 404);
      return;
    }

    const order = orderResult.rows[0];

    sendSuccess(res, 'ORDER_RETRIEVED', {
      orderId: order.id,
      tableQrId: order.table_qr_id,
      status: order.status,
      items: order.items || [],
      totalAmount: order.total_cents / 100.0,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve order', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      sendError(res, 'BAD_REQUEST', `Status must be one of: ${validStatuses.join(', ')}`, 400);
      return;
    }

    // Verify order belongs to merchant via table_qr -> location -> merchant
    const orderResult = await query(
      `SELECT l.merchant_id
       FROM orders o
       JOIN table_qrs tqr ON o.table_qr_id = tqr.id
       JOIN locations l ON tqr.location_id = l.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Order not found', 404);
      return;
    }

    const merchantId = orderResult.rows[0].merchant_id;

    // Verify merchant ownership (merchantId must match the authenticated user's merchantId)
    if (merchantId !== req.user.userId) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      status,
      orderId,
    ]);

    sendSuccess(
      res,
      'ORDER_UPDATED',
      undefined,
      200,
      {
        status,
      }
    );
  } catch (error: any) {
    console.error('Update order status error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to update order status', 500);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId, status, date } = req.query;

    if (!merchantId) {
      sendError(res, 'BAD_REQUEST', 'merchantId is required', 400);
      return;
    }

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

    let queryText = `SELECT 
                       o.id, 
                       o.table_qr_id, 
                       o.status, 
                       o.total_cents, 
                       o.created_at, 
                       o.updated_at,
                       tqr.table_label as table_number,
                       json_agg(
                         json_build_object(
                           'id', oi.id,
                           'menu_item_id', oi.menu_item_id,
                           'quantity', oi.quantity,
                           'price_cents', oi.price_cents,
                           'name', mi.name
                         )
                       ) FILTER (WHERE oi.id IS NOT NULL) as items
                     FROM orders o
                     JOIN table_qrs tqr ON o.table_qr_id = tqr.id
                     JOIN locations l ON tqr.location_id = l.id
                     LEFT JOIN order_items oi ON o.id = oi.order_id
                     LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                     WHERE l.merchant_id = $1`;
    const params: any[] = [merchantId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex += 1;
    }

    if (date) {
      queryText += ` AND DATE(o.created_at) = $${paramIndex}`;
      params.push(date);
      paramIndex += 1;
    }

    queryText += ' GROUP BY o.id, tqr.table_label ORDER BY o.created_at DESC';

    const ordersResult = await query(queryText, params);

    const orders = ordersResult.rows.map((order: any) => ({
      orderId: order.id,
      tableQrId: order.table_qr_id,
      tableNumber: order.table_number,
      status: order.status,
      items: order.items || [],
      totalAmount: order.total_cents / 100.0,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    sendSuccess(res, 'ORDERS_RETRIEVED', orders);
  } catch (error: any) {
    console.error('Get all orders error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve orders', 500);
  }
};

