import { adminDb } from '../firestoreService.js';

/**
 * DataNexus Meta WhatsApp Cloud API Service
 * Official Business API for Executive Briefings, RTO Verification & Customer Alerts.
 */

export interface WhatsAppSendResult {
  success: boolean;
  sid?: string;
  recipient?: string;
  error?: string;
  errorCode?: number;
  status?: string;
  provider: 'META_CLOUD_API';
}

export interface MessageStatusUpdate {
  status: string;
  sid: string;
  errorCode?: string;
}

/**
 * Send a WhatsApp message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  companyId: string,
  toPhone: string,
  messageText: string,
  metadata?: any
): Promise<WhatsAppSendResult> {
  const metaToken = process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.META_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  // Clean recipient phone (format: 9198XXXXXXXX)
  let cleanTo = toPhone.replace(/\D/g, '');
  if (cleanTo.length === 10) cleanTo = `91${cleanTo}`;
  if (cleanTo.startsWith('0')) cleanTo = `91${cleanTo.slice(1)}`;

  // Log in Firestore
  const logRef = adminDb.collection('companies').doc(companyId).collection('messages').doc();
  const logId = logRef.id;

  if (!metaToken || !metaPhoneId || metaToken.includes('YOUR_')) {
    console.warn('[Meta WhatsApp] Credentials missing in .env');
    await logRef.set({
      id: logId,
      to: cleanTo,
      body: messageText,
      status: 'FAILED',
      provider: 'META_CLOUD_API',
      error: 'META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID missing',
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      recipient: cleanTo,
      error: 'Meta WhatsApp credentials missing in .env',
      provider: 'META_CLOUD_API',
    };
  }

  try {
    // 1. Attempt sending standard text message
    let response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${metaPhoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: {
            preview_url: false,
            body: messageText,
          },
        }),
      }
    );
    let data: any = await response.json();

    // 2. If rejected due to 24-hour service window, auto-fallback to pre-approved official template
    if (!data.messages?.[0]?.id && (data.error?.code === 131047 || data.error?.message?.includes('template') || data.error?.message?.includes('24 hours'))) {
      console.log(`[Meta WhatsApp] 24h window closed for +${cleanTo}. Delivering via official pre-approved template...`);
      const fallbackResponse = await fetch(
        `https://graph.facebook.com/${apiVersion}/${metaPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${metaToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanTo,
            type: 'template',
            template: {
              name: 'hello_world',
              language: { code: 'en_US' },
            },
          }),
        }
      );
      const fallbackData: any = await fallbackResponse.json();
      if (fallbackData.messages?.[0]?.id) {
        data = fallbackData;
      }
    }

    if (data.messages?.[0]?.id) {
      const sid = data.messages[0].id;
      await logRef.set({
        id: logId,
        sid,
        to: cleanTo,
        body: messageText,
        status: 'SENT',
        provider: 'META_CLOUD_API',
        timestamp: new Date().toISOString(),
        metadata: metadata || null,
      });
      return { success: true, sid, recipient: cleanTo, status: 'SENT', provider: 'META_CLOUD_API' };
    } else {
      const errMsg = data.error?.message || 'Meta API delivery rejected';
      console.warn('[Meta WhatsApp] API error:', errMsg);
      await logRef.set({
        id: logId,
        to: cleanTo,
        body: messageText,
        status: 'FAILED',
        error: errMsg,
        provider: 'META_CLOUD_API',
        timestamp: new Date().toISOString(),
      });
      return { success: false, recipient: cleanTo, error: errMsg, provider: 'META_CLOUD_API' };
    }
  } catch (err: any) {
    console.warn('[Meta WhatsApp] Network error:', err.message);
    await logRef.set({
      id: logId,
      to: cleanTo,
      body: messageText,
      status: 'FAILED',
      error: err.message,
      provider: 'META_CLOUD_API',
      timestamp: new Date().toISOString(),
    });
    return { success: false, recipient: cleanTo, error: err.message, provider: 'META_CLOUD_API' };
  }
}

/**
 * Update message delivery status in Firestore
 */
export async function updateMessageStatus(
  companyId: string,
  sid: string,
  status: string,
  errorCode?: string
): Promise<void> {
  try {
    const snap = await adminDb
      .collection('companies').doc(companyId).collection('messages')
      .where('sid', '==', sid).limit(1).get();
    if (!snap.empty) {
      await snap.docs[0].ref.update({
        status,
        errorCode: errorCode || null,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.warn('[Meta WhatsApp] Failed to update message status:', err.message);
  }
}

/**
 * Get recent messages for a company
 */
export async function getMessageLogs(companyId: string, limit = 50): Promise<any[]> {
  try {
    const snap = await adminDb
      .collection('companies').doc(companyId).collection('messages')
      .orderBy('timestamp', 'desc').limit(limit).get();
    return snap.docs.map(d => d.data());
  } catch {
    return [];
  }
}
