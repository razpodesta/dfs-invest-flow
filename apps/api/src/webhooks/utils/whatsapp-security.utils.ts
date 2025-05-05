import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';

const logger = new Logger('WebhookSecurity');

export function verifyWebhookSignature(
  rawBody: Buffer,
  appSecret: string,
  signatureHeader: string,
): boolean {
  if (!rawBody || !appSecret || !signatureHeader || typeof signatureHeader !== 'string') {
    logger.warn('Invalid input provided for webhook signature verification.');
    return false;
  }

  const signatureParts = signatureHeader.split('=');
  if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256' || !signatureParts[1]) {
    logger.warn(`Invalid signature header format: ${signatureHeader}`);
    return false;
  }
  const expectedSignature = signatureParts[1];

  const hmac = crypto.createHmac('sha256', appSecret);
  const calculatedSignature = hmac.update(rawBody).digest('hex');

  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const calculatedBuffer = Buffer.from(calculatedSignature, 'hex');

    if (expectedBuffer.length !== calculatedBuffer.length) {
      logger.warn('Signature length mismatch.');
      return false;
    }

    return crypto.timingSafeEqual(calculatedBuffer, expectedBuffer);
  } catch (errorCaught) {
    logger.error(
      'Error comparing signatures, likely due to invalid hex strings.',
      errorCaught instanceof Error ? errorCaught.stack : errorCaught,
    );
    return false;
  }
}
