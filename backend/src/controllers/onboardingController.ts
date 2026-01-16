import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { merchantId, name, menuData, locationName, locationAddress } = req.body;

    if (!merchantId || !name || !menuData) {
      sendError(res, 'BAD_REQUEST', 'merchantId, name, and menuData are required', 400);
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

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Update merchant name if provided
      if (name) {
        await client.query('UPDATE merchants SET name = $1 WHERE id = $2', [name, merchantId]);
      }

      // Create location if provided
      let locationId = null;
      if (locationName) {
        locationId = uuidv4();
        await client.query(
          'INSERT INTO locations (id, merchant_id, name, address) VALUES ($1, $2, $3, $4)',
          [locationId, merchantId, locationName, locationAddress || null]
        );
      } else {
        // Get first location or create default
        const locResult = await client.query('SELECT id FROM locations WHERE merchant_id = $1 LIMIT 1', [merchantId]);
        if (locResult.rows.length > 0) {
          locationId = locResult.rows[0].id;
        } else {
          locationId = uuidv4();
          await client.query(
            'INSERT INTO locations (id, merchant_id, name) VALUES ($1, $2, $3)',
            [locationId, merchantId, 'Main Location']
          );
        }
      }

      // Create menu
      const menuId = uuidv4();
      await client.query(
        'INSERT INTO menus (id, location_id, merchant_id, name, is_active) VALUES ($1, $2, $3, $4, $5)',
        [menuId, locationId, merchantId, 'Main Menu', true]
      );

      // Create sections and items
      if (menuData.sections && Array.isArray(menuData.sections)) {
        for (let i = 0; i < menuData.sections.length; i++) {
          const section = menuData.sections[i];
          const sectionId = uuidv4();

          await client.query(
            'INSERT INTO menu_sections (id, menu_id, title, sort_order) VALUES ($1, $2, $3, $4)',
            [sectionId, menuId, section.name, i]
          );

          if (section.items && Array.isArray(section.items)) {
            for (let j = 0; j < section.items.length; j++) {
              const item = section.items[j];
              const itemId = uuidv4();
              const priceCents = Math.round(parseFloat(item.price || 0) * 100);

              await client.query(
                'INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [
                  itemId,
                  sectionId,
                  item.name,
                  item.description || null,
                  priceCents,
                  item.available !== undefined ? item.available : true,
                  j,
                ]
              );
            }
          }
        }
      }

      await client.query('COMMIT');

      sendSuccess(res, 'ONBOARDING_COMPLETED', undefined, 200, {
        merchant: {
          merchantId,
          name,
          locationId,
          menuId,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to complete onboarding', 500);
  }
};

export const uploadMenuImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const file = (req as any).file;
    if (!file) {
      sendError(res, 'BAD_REQUEST', 'Image file is required', 400);
      return;
    }

    const { merchantId, itemId } = req.body;

    if (!merchantId || !itemId) {
      sendError(res, 'BAD_REQUEST', 'merchantId and itemId are required', 400);
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

    // In production, upload to S3 and get public URL
    // For now, return a placeholder URL
    const cdnUrl = process.env.CDN_URL || 'https://cdn.example.com';
    const imageUrl = `${cdnUrl}/menu-images/${itemId}-${Date.now()}.${file.originalname.split('.').pop()}`;

    // Update menu item with image URL
    await query('UPDATE menu_items SET image_url = $1 WHERE id = $2', [
      imageUrl,
      itemId,
    ]);

    sendSuccess(res, 'IMAGE_UPLOADED', undefined, 200, {
      imageUrl,
    });
  } catch (error: any) {
    console.error('Upload menu image error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to upload image', 500);
  }
};

