import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getMenuByQrToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { qrToken } = req.params;

    const qrResult = await query(
      'SELECT menu_id FROM table_qrs WHERE qr_token = $1',
      [qrToken]
    );

    if (qrResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'QR code not found', 404);
      return;
    }

    const { menu_id } = qrResult.rows[0];
    await getMenuById(req, res, menu_id);
  } catch (error: any) {
    console.error('Get menu by QR token error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve menu', 500);
  }
};

export const getMenuById = async (
  req: AuthRequest,
  res: Response,
  menuIdParam?: string | any
): Promise<void> => {
  try {
    // If called as route handler, Express passes (req, res, next), so menuIdParam might be the next function
    // If called internally, menuIdParam will be a string
    // Always prefer req.params.menuId when available (route handler), otherwise use menuIdParam if it's a string
    const menuId = (req.params.menuId) || (typeof menuIdParam === 'string' ? menuIdParam : undefined);
    
    if (!menuId) {
      sendError(res, 'BAD_REQUEST', 'Menu ID is required', 400);
      return;
    }

    const menuResult = await query(
      `SELECT m.*, me.name as merchant_name, me.id as merchant_id
       FROM menus m
       JOIN merchants me ON m.merchant_id = me.id
       WHERE m.id = $1`,
      [menuId]
    );

    if (menuResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Menu not found', 404);
      return;
    }

    const menu = menuResult.rows[0];

    // Get sections with items
    const sectionsResult = await query(
      `SELECT s.id, s.title, s.sort_order,
              json_agg(
                json_build_object(
                  'id', i.id,
                  'name', i.name,
                  'description', i.description,
                  'price', i.price_cents::numeric / 100.0,
                  'image', i.image_url,
                  'available', i.is_available
                ) ORDER BY i.sort_order
              ) FILTER (WHERE i.id IS NOT NULL) as items
       FROM menu_sections s
       LEFT JOIN menu_items i ON s.id = i.section_id AND i.is_available = TRUE
       WHERE s.menu_id = $1
       GROUP BY s.id, s.title, s.sort_order
       ORDER BY s.sort_order`,
      [menuId]
    );

    const sections = sectionsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.title,
      items: row.items || [],
    }));

    sendSuccess(res, 'MENU_RETRIEVED', {
      menuId: menu.id,
      merchantId: menu.merchant_id,
      merchantName: menu.merchant_name,
      orderEnabled: menu.is_active,
      sections,
    });
  } catch (error: any) {
    console.error('Get menu error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve menu', 500);
  }
};

export const getMenuBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { merchantSlug, menuName } = req.params;

    if (!merchantSlug || !menuName) {
      sendError(res, 'BAD_REQUEST', 'Merchant slug and menu name are required', 400);
      return;
    }

    // Decode URL parameters
    const merchantSlugDecoded = decodeURIComponent(merchantSlug);
    const menuNameDecoded = decodeURIComponent(menuName);

    // Get menu by merchant slug and menu name
    // Match by merchant name (converting between slug format and normal format)
    // Note: slug column may not exist in all databases, so we match by name only
    const menuResult = await query(
      `SELECT m.*, me.name as merchant_name, me.id as merchant_id
       FROM menus m
       JOIN merchants me ON m.merchant_id = me.id
       WHERE (
         LOWER(REPLACE(me.name, ' ', '-')) = LOWER($1)
         OR LOWER(me.name) = LOWER(REPLACE($1, '-', ' '))
       )
       AND (
         LOWER(REPLACE(m.name, ' ', '-')) = LOWER($2)
         OR LOWER(m.name) = LOWER(REPLACE($2, '-', ' '))
       )`,
      [merchantSlugDecoded, menuNameDecoded]
    );

    if (menuResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Menu not found', 404);
      return;
    }

    const menu = menuResult.rows[0];

    // Get sections with items
    const sectionsResult = await query(
      `SELECT s.id, s.title, s.sort_order,
              json_agg(
                json_build_object(
                  'id', i.id,
                  'name', i.name,
                  'description', i.description,
                  'price', i.price_cents::numeric / 100.0,
                  'image', i.image_url,
                  'available', i.is_available
                ) ORDER BY i.sort_order
              ) FILTER (WHERE i.id IS NOT NULL) as items
       FROM menu_sections s
       LEFT JOIN menu_items i ON s.id = i.section_id AND i.is_available = TRUE
       WHERE s.menu_id = $1
       GROUP BY s.id, s.title, s.sort_order
       ORDER BY s.sort_order`,
      [menu.id]
    );

    const sections = sectionsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.title,
      items: row.items || [],
    }));

    sendSuccess(res, 'MENU_RETRIEVED', {
      menuId: menu.id,
      merchantId: menu.merchant_id,
      merchantName: menu.merchant_name,
      orderEnabled: menu.is_active,
      sections,
    });
  } catch (error: any) {
    console.error('Get menu by slug error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve menu', 500);
  }
};

export const getMenuItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;

    const itemsResult = await query(
      `SELECT i.*, i.section_id
       FROM menu_items i
       JOIN menu_sections s ON i.section_id = s.id
       WHERE s.menu_id = $1 AND i.is_available = TRUE
       ORDER BY s.sort_order, i.sort_order`,
      [menuId]
    );

    const items = itemsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price_cents / 100.0,
      image: row.image_url,
      available: row.is_available,
      sectionId: row.section_id,
    }));

    sendSuccess(res, 'ITEMS_RETRIEVED', items);
  } catch (error: any) {
    console.error('Get menu items error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve menu items', 500);
  }
};

export const getMenuConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;

    const menuResult = await query('SELECT is_active FROM menus WHERE id = $1', [menuId]);

    if (menuResult.rows.length === 0) {
      sendError(res, 'NOT_FOUND', 'Menu not found', 404);
      return;
    }

    const menu = menuResult.rows[0];

    sendSuccess(res, 'CONFIG_RETRIEVED', {
      orderEnabled: menu.is_active,
      currency: 'USD',
      taxRate: 0.08,
      serviceCharge: 0.0,
    });
  } catch (error: any) {
    console.error('Get menu config error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve menu configuration', 500);
  }
};

export const createOrUpdateMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId, menuName, orderEnabled, sections } = req.body;

    if (!merchantId || !menuName || !sections) {
      sendError(res, 'BAD_REQUEST', 'merchantId, menuName, and sections are required', 400);
      return;
    }

    // Verify merchant ownership (merchantId must match the authenticated user's merchantId)
    const userMerchantId = req.user.merchantId || req.user.userId;
    if (merchantId !== userMerchantId) {
      sendError(res, 'FORBIDDEN', 'Merchant not found or access denied', 403);
      return;
    }

    const merchantResult = await query('SELECT id FROM merchants WHERE id = $1', [merchantId]);

    if (merchantResult.rows.length === 0) {
      sendError(res, 'FORBIDDEN', 'Merchant not found or access denied', 403);
      return;
    }

    const client = await getClient();
    let menuId: string;

    try {
      await client.query('BEGIN');

      // Check if menu exists
      const existingMenu = await client.query('SELECT id FROM menus WHERE merchant_id = $1 LIMIT 1', [
        merchantId,
      ]);

      if (existingMenu.rows.length > 0) {
        menuId = existingMenu.rows[0].id;
        await client.query('UPDATE menus SET name = $1, is_active = $2 WHERE id = $3', [
          menuName,
          orderEnabled !== undefined ? orderEnabled : true,
          menuId,
        ]);
      } else {
        menuId = uuidv4();
        await client.query(
          'INSERT INTO menus (id, merchant_id, name, is_active) VALUES ($1, $2, $3, $4)',
          [menuId, merchantId, menuName, orderEnabled !== undefined ? orderEnabled : true]
        );
      }

      // Delete existing sections and items
      await client.query('DELETE FROM menu_items WHERE section_id IN (SELECT id FROM menu_sections WHERE menu_id = $1)', [
        menuId,
      ]);
      await client.query('DELETE FROM menu_sections WHERE menu_id = $1', [menuId]);

      // Insert new sections and items
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionId = uuidv4();

        await client.query('INSERT INTO menu_sections (id, menu_id, title, sort_order) VALUES ($1, $2, $3, $4)', [
          sectionId,
          menuId,
          section.name,
          i,
        ]);

        if (section.items && Array.isArray(section.items)) {
          for (let j = 0; j < section.items.length; j++) {
            const item = section.items[j];
            const itemId = uuidv4();

            await client.query(
              'INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [
                itemId,
                sectionId,
                item.name,
                item.description || null,
                item.price*100,
                item.is_available !== undefined ? item.is_available : true,
                j,
              ]
            );
          }
        }
      }

      await client.query('COMMIT');

      sendSuccess(
        res,
        'MENU_CREATED',
        undefined,
        201,
        {
          menu: {
            menuId,
            merchantId,
            menuName,
            createdAt: new Date().toISOString(),
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
    console.error('Create/update menu error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to create/update menu', 500);
  }
};

