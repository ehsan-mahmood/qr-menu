import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { query } from '../db/connection';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Initialize AWS Textract
const textract = new AWS.Textract({
  region: process.env.AWS_TEXTRACT_REGION || 'us-east-1',
});

// Simple menu parser (basic implementation)
const parseMenuText = (text: string): any => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const sections: any[] = [];
  let currentSection: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Simple heuristic: lines in ALL CAPS or ending with ":" might be section headers
    if (trimmed === trimmed.toUpperCase() && trimmed.length < 30 || trimmed.endsWith(':')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        name: trimmed.replace(':', ''),
        items: [],
      };
    } else {
      // Try to parse item with price (e.g., "Espresso $3.50" or "Espresso 3.50")
      const priceMatch = trimmed.match(/(.+?)\s+[\$]?(\d+\.?\d*)/);
      if (priceMatch) {
        const itemName = priceMatch[1].trim();
        const price = parseFloat(priceMatch[2]);
        
        if (!currentSection) {
          currentSection = { name: 'Menu Items', items: [] };
        }
        
        currentSection.items.push({
          name: itemName,
          price: price,
          description: '',
        });
      } else if (currentSection && currentSection.items.length > 0) {
        // Might be a description for the last item
        const lastItem = currentSection.items[currentSection.items.length - 1];
        if (!lastItem.description) {
          lastItem.description = trimmed;
        }
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ name: 'Menu Items', items: [] }];
};

export const parseMenuImage = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { merchantId } = req.body;

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

    // Use AWS Textract for OCR (if configured)
    let parsedText = '';
    let confidence = 0.95;

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const textractParams = {
          Document: {
            Bytes: file.buffer,
          },
        };

        const textractResult = await textract.detectDocumentText(textractParams).promise();
        
        // Extract text from Textract response
        const textBlocks = textractResult.Blocks?.filter((block: any) => block.BlockType === 'LINE') || [];
        parsedText = textBlocks.map((block: any) => block.Text).join('\n');
        confidence = textractResult.Blocks?.[0]?.Confidence ? textractResult.Blocks[0].Confidence / 100 : 0.95;
      } catch (textractError: any) {
        console.error('Textract error:', textractError);
        // Fallback: return error or use basic parsing
        sendError(res, 'INTERNAL_ERROR', 'OCR processing failed. Please try again or use manual entry.', 500);
        return;
      }
    } else {
      // AWS Textract not configured - return error suggesting manual entry
      sendError(res, 'BAD_REQUEST', 'OCR service not configured. Please use manual entry or configure AWS Textract.', 400);
      return;
    }

    // Parse menu text into structured format
    const sections = parseMenuText(parsedText);

    const ocrId = uuidv4();

    sendSuccess(res, 'OCR_PARSED', {
      parsedText,
      confidence,
      sections,
    });
  } catch (error: any) {
    console.error('Parse menu image error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to parse menu image', 500);
  }
};

export const getOcrStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const { ocrId } = req.params;

    // In a real implementation, you might store OCR job status in a database
    // For now, return a simple response
    sendSuccess(res, 'OCR_STATUS', {
      ocrId,
      status: 'completed',
      progress: 100,
      result: {
        parsedText: '',
        sections: [],
      },
    });
  } catch (error: any) {
    console.error('Get OCR status error:', error);
    sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve OCR status', 500);
  }
};

