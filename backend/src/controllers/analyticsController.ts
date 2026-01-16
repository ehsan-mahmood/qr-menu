import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const postEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventType, merchantId, menuItemId } = req.body;

    if (!eventType || !merchantId) {
      sendError(res, 'BAD_REQUEST', 'eventType and merchantId are required', 400);
      return;
    }

    const validEventTypes = ['menu_view', 'item_click', 'item_added', 'order_placed', 'qr_scan'];
    if (!validEventTypes.includes(eventType)) {
      sendError(res, 'BAD_REQUEST', `eventType must be one of: ${validEventTypes.join(', ')}`, 400);
      return;
    }

    const eventId = uuidv4();

    await query(
      `INSERT INTO events (id, merchant_id, event_type, menu_item_id, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [eventId, merchantId, eventType, menuItemId || null]
    );

    sendSuccess(res, 'EVENT_RECORDED', undefined, 201, { success: true });
  } catch (error: any) {
    console.error('Post event error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to record event', 500);
  }
};

export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify merchant ownership (merchantId must match the authenticated user's merchantId)
    const userMerchantId = req.user.merchantId || req.user.userId;
    if (merchantId !== userMerchantId) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    const merchantResult = await query('SELECT id FROM merchants WHERE id = $1', [merchantId]);

    if (merchantResult.rows.length === 0) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    // Build date filter conditions and parameters for each query
    // Each query needs its own date filter with correct table alias and parameter indices
    
    // For events table queries
    let eventsDateFilter = '';
    const eventsParams: any[] = [merchantId];
    let eventsParamIndex = 2;
    
    if (startDate && endDate) {
      eventsDateFilter = `AND e.created_at BETWEEN $${eventsParamIndex} AND $${eventsParamIndex + 1}`;
      eventsParams.push(startDate, endDate);
      eventsParamIndex += 2;
    } else if (startDate) {
      eventsDateFilter = `AND e.created_at >= $${eventsParamIndex}`;
      eventsParams.push(startDate);
      eventsParamIndex += 1;
    } else if (endDate) {
      eventsDateFilter = `AND e.created_at <= $${eventsParamIndex}`;
      eventsParams.push(endDate);
      eventsParamIndex += 1;
    }

    // For orders table queries
    let ordersDateFilter = '';
    const ordersParams: any[] = [merchantId];
    let ordersParamIndex = 2;
    
    if (startDate && endDate) {
      ordersDateFilter = `AND o.created_at BETWEEN $${ordersParamIndex} AND $${ordersParamIndex + 1}`;
      ordersParams.push(startDate, endDate);
      ordersParamIndex += 2;
    } else if (startDate) {
      ordersDateFilter = `AND o.created_at >= $${ordersParamIndex}`;
      ordersParams.push(startDate);
      ordersParamIndex += 1;
    } else if (endDate) {
      ordersDateFilter = `AND o.created_at <= $${ordersParamIndex}`;
      ordersParams.push(endDate);
      ordersParamIndex += 1;
    }

    // Total scans (qr_scan events)
    const scansResult = await query(
      `SELECT COUNT(*) as count FROM events e WHERE e.merchant_id = $1 AND e.event_type = 'qr_scan' ${eventsDateFilter}`,
      eventsParams
    );
    const totalScans = parseInt(scansResult.rows[0].count, 10);

    // Total orders (via table_qrs -> locations -> merchant)
    const ordersResult = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(o.total_cents), 0) as total_cents
       FROM orders o
       JOIN table_qrs tqr ON o.table_qr_id = tqr.id
       JOIN locations l ON tqr.location_id = l.id
       WHERE l.merchant_id = $1 ${ordersDateFilter}`,
      ordersParams
    );
    const totalOrders = parseInt(ordersResult.rows[0].count, 10);
    const totalRevenue = parseFloat(ordersResult.rows[0].total_cents || '0') / 100.0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top items (from events with menu_item_id)
    const topItemsResult = await query(
      `SELECT e.menu_item_id, mi.name, COUNT(*) as order_count
       FROM events e
       LEFT JOIN menu_items mi ON e.menu_item_id = mi.id
       WHERE e.merchant_id = $1 AND e.event_type = 'item_added' ${eventsDateFilter}
       GROUP BY e.menu_item_id, mi.name
       ORDER BY order_count DESC
       LIMIT 10`,
      eventsParams
    );

    const topItems = topItemsResult.rows.map((row: any) => ({
      itemId: row.menu_item_id,
      name: row.name || 'Unknown',
      orderCount: parseInt(row.order_count, 10),
      revenue: 0, // Would need to join with menu_items to get price
    }));

    // Recent orders
    const recentOrdersResult = await query(
      `SELECT o.id, o.table_qr_id, o.total_cents, o.status, o.created_at
       FROM orders o
       JOIN table_qrs tqr ON o.table_qr_id = tqr.id
       JOIN locations l ON tqr.location_id = l.id
       WHERE l.merchant_id = $1
       ORDER BY o.created_at DESC
       LIMIT 10`,
      [merchantId]
    );

    const recentOrders = recentOrdersResult.rows.map((order: any) => ({
      orderId: order.id,
      tableQrId: order.table_qr_id,
      totalAmount: order.total_cents / 100.0,
      status: order.status,
      timestamp: order.created_at,
    }));

    sendSuccess(res, 'ANALYTICS_RETRIEVED', {
      totalScans,
      totalOrders,
      avgOrderValue,
      topItems,
      recentOrders,
    });
  } catch (error: any) {
    console.error('Get dashboard analytics error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve analytics', 500);
  }
};

export const getTopItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId } = req.params;
    const { limit = 10 } = req.query;

    // Verify merchant ownership (merchantId must match the authenticated user's merchantId)
    const userMerchantId = req.user.merchantId || req.user.userId;
    if (merchantId !== userMerchantId) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    const merchantResult = await query('SELECT id FROM merchants WHERE id = $1', [merchantId]);

    if (merchantResult.rows.length === 0) {
      sendError(res, 'FORBIDDEN', 'Access denied', 403);
      return;
    }

    const topItemsResult = await query(
      `SELECT 
         e.menu_item_id,
         mi.name,
         COUNT(*) as order_count,
         mi.price_cents
       FROM events e
       LEFT JOIN menu_items mi ON e.menu_item_id = mi.id
       WHERE e.merchant_id = $1 AND e.event_type = 'item_added'
       GROUP BY e.menu_item_id, mi.name, mi.price_cents
       ORDER BY order_count DESC
       LIMIT $2`,
      [merchantId, parseInt(limit as string, 10)]
    );

    const topItems = topItemsResult.rows.map((row: any) => ({
      itemId: row.menu_item_id,
      name: row.name || 'Unknown',
      orderCount: parseInt(row.order_count, 10),
      revenue: row.price_cents ? (row.price_cents / 100.0) * parseInt(row.order_count, 10) : 0,
      avgRating: null, // Not implemented yet
    }));

    sendSuccess(res, 'TOP_ITEMS_RETRIEVED', topItems);
  } catch (error: any) {
    console.error('Get top items error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve top items', 500);
  }
};

