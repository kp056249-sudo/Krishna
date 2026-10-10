import { adminDb } from '../firestoreService.js';

/**
 * DataNexus Meta WhatsApp Cloud API Service (Official v21.0)
 * Handles Approved Templates, Parameter Validation, 24h Window & Webhook Delivery Tracking.
 */

export interface WhatsAppSendResult {
  success: boolean;
  wamid?: string;
  sid?: string;
  recipient?: string;
  error?: string;
  errorCode?: number;
  status?: string;
  provider: 'META_CLOUD_API';
}

export interface WhatsAppTemplateConfig {
  id: string;
  name: string;
  language: 'en' | 'en_US';
  variableCount: number;
  category: 'UTILITY';
  event: string;
  description: string;
  sampleParameters: string[];
  lastTestedAt?: string;
  lastTestStatus?: 'SUCCESS' | 'FAILED';
  lastWamid?: string;
  lastError?: string;
}

/**
 * Verified Meta Approved Active Templates
 */
export const APPROVED_TEMPLATES: WhatsAppTemplateConfig[] = [
  {
    id: 'datanexus_report',
    name: 'datanexus_report',
    language: 'en',
    variableCount: 7,
    category: 'UTILITY',
    event: 'daily_briefing',
    description: 'Daily 8 AM founder report with complete financials, stock & logistics',
    sampleParameters: [
      'Founder',
      'Daily Morning Briefing',
      '11 Oct 2026',
      'GMV Rs 1.45 Cr, Net Profit 28.4%',
      'All SKUs above safety stock',
      'RTO 14.3%, 8,570 shipments delivered',
      'Verify unconfirmed COD orders to keep RTO under 12%'
    ]
  },
  {
    id: 'delivary',
    name: 'delivary',
    language: 'en_US',
    variableCount: 2,
    category: 'UTILITY',
    event: 'order_delivered',
    description: 'Order delivered customer confirmation',
    sampleParameters: ['Pavan', '#ORD-1042']
  },
  {
    id: 'not_delivary',
    name: 'not_delivary',
    language: 'en_US',
    variableCount: 3,
    category: 'UTILITY',
    event: 'delivery_failed_ndr',
    description: 'Delivery attempt failed / NDR customer re-attempt alert',
    sampleParameters: ['Pavan', 'Today', '+91 92505 09070']
  },
  {
    id: 'scheduled',
    name: 'scheduled',
    language: 'en_US',
    variableCount: 3,
    category: 'UTILITY',
    event: 'scheduled_reminder',
    description: 'Reminder / scheduled alert message',
    sampleParameters: ['DataNexus Pro', '9070', 'Tomorrow 8:00 AM']
  },
  {
    id: 'datanexus_update',
    name: 'datanexus_update',
    language: 'en',
    variableCount: 3,
    category: 'UTILITY',
    event: 'general_update',
    description: 'General update ya critical system alert',
    sampleParameters: ['Executive Briefing', '11 Oct 2026, 8:00 AM IST', 'Gross GMV Rs 1.45 Cr | Profit 28.4% | RTO 14.3%']
  },
  {
    id: '_datanexus_full',
    name: '_datanexus_full',
    language: 'en',
    variableCount: 10,
    category: 'UTILITY',
    event: 'full_details',
    description: 'Comprehensive operational & financial full report',
    sampleParameters: [
      'Founder',
      '11 Oct 2026, 8:00 AM IST',
      'GMV Rs 1.45 Cr, Net Margin 28.4%',
      '10,000 audited, 8,570 delivered',
      'All SKUs healthy',
      'RTO 14.3%, OTP guard active',
      'Courier SLAs 94.2% on-time',
      '1 Shopify storefront sync OK',
      '3 executive sessions active',
      'Verify unconfirmed COD orders'
    ]
  },
  {
    id: 'datanexus_message',
    name: 'datanexus_message',
    language: 'en',
    variableCount: 4,
    category: 'UTILITY',
    event: 'customer_notification',
    description: 'Normal customer/stakeholder notification',
    sampleParameters: ['Founder', 'Stockout Alert', 'SKU Blue Kurta M has only 8 units left', 'ALERT-1042']
  },
  {
    id: 'date',
    name: 'date',
    language: 'en_US',
    variableCount: 2,
    category: 'UTILITY',
    event: 'delivery_reschedule',
    description: 'Unsuccessful delivery attempt re-delivery prompt',
    sampleParameters: ['#ORD-1042', 'reply with preferred date']
  },
  {
    id: 'hello_world',
    name: 'hello_world',
    language: 'en_US',
    variableCount: 0,
    category: 'UTILITY',
    event: 'connection_test',
    description: 'Meta Cloud API connection test ping',
    sampleParameters: []
  }
];

export const TEMPLATE_EVENTS = [
  { id: 'daily_briefing', label: 'Daily 8 AM Founder Report', defaultTemplate: 'datanexus_report' },
  { id: 'order_delivered', label: 'Order Delivered Confirmation', defaultTemplate: 'delivary' },
  { id: 'delivery_failed_ndr', label: 'Delivery Fail / NDR Alert', defaultTemplate: 'not_delivary' },
  { id: 'scheduled_reminder', label: 'Reminder / Scheduled Message', defaultTemplate: 'scheduled' },
  { id: 'general_update', label: 'General Update ya Alert', defaultTemplate: 'datanexus_update' },
  { id: 'full_details', label: 'Full Details Comprehensive Report', defaultTemplate: '_datanexus_full' },
  { id: 'customer_notification', label: 'Normal Customer Message', defaultTemplate: 'datanexus_message' },
  { id: 'delivery_reschedule', label: 'Delivery Reschedule Alert', defaultTemplate: 'date' },
  { id: 'connection_test', label: 'Connection Test Ping', defaultTemplate: 'hello_world' },
];

function getMetaCredentials() {
  const token = (
    process.env.META_WHATSAPP_TOKEN ||
    process.env.WHATSAPP_TOKEN ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    ''
  ).trim();

  const phoneId = (
    process.env.META_PHONE_NUMBER_ID ||
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    '1398161436704734'
  ).trim();

  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  return { token, phoneId, apiVersion };
}

/**
 * Validate variables count, presence, and Meta format constraints
 */
export function validateTemplateParameters(
  template: WhatsAppTemplateConfig,
  parameters: string[] = []
): { valid: boolean; error?: string; cleanParams: string[] } {
  if (parameters.length !== template.variableCount) {
    return {
      valid: false,
      error: `Variable count mismatch (Code 132000): Template "${template.name}" requires exactly ${template.variableCount} parameter(s), but received ${parameters.length}.`,
      cleanParams: []
    };
  }

  const cleanParams: string[] = [];
  for (let i = 0; i < parameters.length; i++) {
    let p = String(parameters[i] || '').trim();
    if (p.length === 0) {
      return {
        valid: false,
        error: `Parameter {{${i + 1}}} cannot be empty.`,
        cleanParams: []
      };
    }
    // Meta Rule: No newlines
    p = p.replace(/[\r\n]+/g, ' ');
    // Meta Rule: No more than 4 consecutive spaces
    p = p.replace(/\s{4,}/g, '   ');
    cleanParams.push(p);
  }

  return { valid: true, cleanParams };
}

/**
 * Check if a recipient phone number has opted out (STOP / UNSUBSCRIBE)
 */
export async function isRecipientOptedOut(companyId: string, cleanPhone: string): Promise<boolean> {
  try {
    const snap = await adminDb.collection('companies').doc(companyId)
      .collection('whatsapp_recipients')
      .where('cleanPhone', '==', cleanPhone).limit(1).get();
    if (!snap.empty) {
      const data = snap.docs[0].data();
      return Boolean(data.optOut === true);
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if customer sent an inbound message within the last 24 hours
 */
export async function isWithinCustomerWindow(companyId: string, cleanPhone: string): Promise<boolean> {
  try {
    const snap = await adminDb.collection('companies').doc(companyId)
      .collection('messages')
      .where('to', '==', cleanPhone)
      .where('direction', '==', 'INBOUND')
      .orderBy('timestamp', 'desc').limit(1).get();
    if (!snap.empty) {
      const lastMsgTime = new Date(snap.docs[0].data().timestamp).getTime();
      return (Date.now() - lastMsgTime) < (24 * 60 * 60 * 1000);
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Retrieve configured templates from Firestore (with fallback to verified defaults)
 */
export async function getCompanyTemplates(companyId: string): Promise<WhatsAppTemplateConfig[]> {
  try {
    const docSnap = await adminDb.collection('companies').doc(companyId)
      .collection('whatsapp').doc('templates').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (Array.isArray(data?.templates) && data.templates.length > 0) {
        return data.templates;
      }
    }
  } catch {}
  return APPROVED_TEMPLATES;
}

/**
 * Save updated template mappings to Firestore
 */
export async function saveCompanyTemplates(
  companyId: string,
  templates: WhatsAppTemplateConfig[]
): Promise<boolean> {
  try {
    await adminDb.collection('companies').doc(companyId)
      .collection('whatsapp').doc('templates').set({
        templates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Send an approved WhatsApp Template via Meta Cloud API
 */
export async function sendWhatsAppTemplate(
  companyId: string,
  toPhone: string,
  templateName: string,
  parameters: string[] = [],
  metadata?: any
): Promise<WhatsAppSendResult> {
  const { token, phoneId, apiVersion } = getMetaCredentials();

  let cleanTo = toPhone.replace(/\D/g, '');
  if (cleanTo.length === 10) cleanTo = `91${cleanTo}`;
  if (cleanTo.startsWith('0')) cleanTo = `91${cleanTo.slice(1)}`;

  const logRef = adminDb.collection('companies').doc(companyId).collection('messages').doc();
  const logId = logRef.id;

  // 1. Opt-out check (Customer sent "STOP")
  const optedOut = await isRecipientOptedOut(companyId, cleanTo);
  if (optedOut) {
    const errorMsg = `Recipient +${cleanTo} has opted out of automated WhatsApp communications (STOP requested).`;
    await logRef.set({
      id: logId,
      to: cleanTo,
      templateName,
      status: 'OPTED_OUT',
      error: errorMsg,
      direction: 'OUTBOUND',
      provider: 'META_CLOUD_API',
      timestamp: new Date().toISOString()
    });
    return { success: false, recipient: cleanTo, error: errorMsg, status: 'OPTED_OUT', provider: 'META_CLOUD_API' };
  }

  // 2. Resolve template definition
  const allTemplates = await getCompanyTemplates(companyId);
  const template = allTemplates.find(t => t.name.toLowerCase() === templateName.toLowerCase());
  if (!template) {
    const errorMsg = `Meta Error 132001: Template "${templateName}" is not registered or approved in Meta WhatsApp Manager.`;
    await logRef.set({
      id: logId,
      to: cleanTo,
      templateName,
      status: 'FAILED',
      errorCode: 132001,
      error: errorMsg,
      direction: 'OUTBOUND',
      provider: 'META_CLOUD_API',
      timestamp: new Date().toISOString()
    });
    return { success: false, recipient: cleanTo, error: errorMsg, errorCode: 132001, status: 'FAILED', provider: 'META_CLOUD_API' };
  }

  // 3. Validate variable count & formatting
  const validation = validateTemplateParameters(template, parameters);
  if (!validation.valid) {
    await logRef.set({
      id: logId,
      to: cleanTo,
      templateName: template.name,
      status: 'FAILED',
      errorCode: 132000,
      error: validation.error,
      direction: 'OUTBOUND',
      provider: 'META_CLOUD_API',
      timestamp: new Date().toISOString()
    });
    return { success: false, recipient: cleanTo, error: validation.error, errorCode: 132000, status: 'FAILED', provider: 'META_CLOUD_API' };
  }

  if (!token || !phoneId || token.includes('YOUR_')) {
    const errorMsg = 'Meta WhatsApp credentials missing in environment (.env).';
    return { success: false, recipient: cleanTo, error: errorMsg, status: 'UNCONFIGURED', provider: 'META_CLOUD_API' };
  }

  // 4. Construct payload strictly according to Meta Cloud API specification
  const templatePayload: any = {
    name: template.name,
    language: { code: template.language }
  };

  if (validation.cleanParams.length > 0) {
    templatePayload.components = [
      {
        type: 'body',
        parameters: validation.cleanParams.map(val => ({
          type: 'text',
          text: val
        }))
      }
    ];
  }

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: 'template',
        template: templatePayload
      })
    });

    const data: any = await response.json();

    if (data.messages?.[0]?.id) {
      const wamid = data.messages[0].id;

      await logRef.set({
        id: logId,
        sid: wamid,
        wamid,
        to: cleanTo,
        templateName: template.name,
        parameters: validation.cleanParams,
        status: 'SENT', // Will change to DELIVERED only when Meta Webhook notifies
        provider: 'META_CLOUD_API',
        direction: 'OUTBOUND',
        metadata: metadata || null,
        timestamp: new Date().toISOString()
      });

      // Update template last test status in Firestore
      const updatedTemplates = allTemplates.map(t => {
        if (t.id === template.id) {
          return {
            ...t,
            lastTestedAt: new Date().toISOString(),
            lastTestStatus: 'SUCCESS' as const,
            lastWamid: wamid,
            lastError: undefined
          };
        }
        return t;
      });
      await saveCompanyTemplates(companyId, updatedTemplates);

      return {
        success: true,
        wamid,
        sid: wamid,
        recipient: cleanTo,
        status: 'SENT',
        provider: 'META_CLOUD_API'
      };
    } else {
      let errMsg = data.error?.message || 'Meta Cloud API rejected dispatch';
      const errCode = data.error?.code;

      if (errCode === 100 && (cleanTo === '919250509070' || errMsg.includes('Invalid parameter'))) {
        errMsg = 'Meta Error 100: Cannot send message to sender business number (+91 92505 09070) itself. Please enter a different recipient phone number.';
      } else if (errCode === 131058) {
        errMsg = 'Meta Error 131058: hello_world template is restricted by Meta to public sandbox test numbers. Custom verified business numbers must use approved custom templates.';
      } else if (errCode === 131030) {
        errMsg = `Meta Sandbox Error 131030: Recipient +${cleanTo} is not in your Meta Developer allowed test numbers list.`;
      } else if (errCode === 131047) {
        errMsg = 'Meta Error 131047: 24-hour service conversation window is closed. Outbound message must use an approved template.';
      } else if (errCode === 132000) {
        errMsg = `Meta Error 132000: Template parameter mismatch. Provided parameters do not match Meta approved format for "${template.name}".`;
      } else if (errCode === 132001) {
        errMsg = `Meta Error 132001: Template "${template.name}" does not exist in Meta account for language "${template.language}".`;
      } else if (errCode === 190) {
        errMsg = 'Meta OAuth Error 190: Access token expired. Please update META_WHATSAPP_TOKEN in .env.';
      }

      await logRef.set({
        id: logId,
        to: cleanTo,
        templateName: template.name,
        status: 'FAILED',
        errorCode: errCode,
        error: errMsg,
        direction: 'OUTBOUND',
        provider: 'META_CLOUD_API',
        timestamp: new Date().toISOString()
      });

      // Update template last test failure
      const updatedTemplates = allTemplates.map(t => {
        if (t.id === template.id) {
          return {
            ...t,
            lastTestedAt: new Date().toISOString(),
            lastTestStatus: 'FAILED' as const,
            lastError: errMsg
          };
        }
        return t;
      });
      await saveCompanyTemplates(companyId, updatedTemplates);

      return {
        success: false,
        recipient: cleanTo,
        error: errMsg,
        errorCode: errCode,
        status: 'FAILED',
        provider: 'META_CLOUD_API'
      };
    }
  } catch (err: any) {
    await logRef.set({
      id: logId,
      to: cleanTo,
      templateName: template.name,
      status: 'FAILED',
      error: err.message,
      direction: 'OUTBOUND',
      provider: 'META_CLOUD_API',
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      recipient: cleanTo,
      error: err.message,
      status: 'FAILED',
      provider: 'META_CLOUD_API'
    };
  }
}

/**
 * Send standard free-form text message (Permitted ONLY if customer replied within 24 hours,
 * otherwise falls back automatically to approved template).
 */
export async function sendWhatsAppMessage(
  companyId: string,
  toPhone: string,
  messageText: string,
  metadata?: any
): Promise<WhatsAppSendResult> {
  const { token, phoneId, apiVersion } = getMetaCredentials();

  let cleanTo = toPhone.replace(/\D/g, '');
  if (cleanTo.length === 10) cleanTo = `91${cleanTo}`;
  if (cleanTo.startsWith('0')) cleanTo = `91${cleanTo.slice(1)}`;

  // Rule: First message from business must be template unless customer replied in last 24h
  const withinWindow = await isWithinCustomerWindow(companyId, cleanTo);
  if (!withinWindow) {
    console.log(`[Meta WhatsApp] Customer +${cleanTo} has no active 24h inbound window. Dispatching approved datanexus_update template instead...`);
    return sendWhatsAppTemplate(
      companyId,
      cleanTo,
      'datanexus_update',
      [
        'Business Notification',
        new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        messageText.replace(/[\r\n]+/g, ' ').substring(0, 160)
      ],
      metadata
    );
  }

  const logRef = adminDb.collection('companies').doc(companyId).collection('messages').doc();
  const logId = logRef.id;

  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanTo,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const data: any = await response.json();
    if (data.messages?.[0]?.id) {
      const wamid = data.messages[0].id;
      await logRef.set({
        id: logId,
        sid: wamid,
        wamid,
        to: cleanTo,
        body: messageText,
        status: 'SENT',
        provider: 'META_CLOUD_API',
        direction: 'OUTBOUND',
        timestamp: new Date().toISOString()
      });
      return { success: true, wamid, sid: wamid, recipient: cleanTo, status: 'SENT', provider: 'META_CLOUD_API' };
    } else {
      return { success: false, recipient: cleanTo, error: data.error?.message, errorCode: data.error?.code, provider: 'META_CLOUD_API' };
    }
  } catch (err: any) {
    return { success: false, recipient: cleanTo, error: err.message, provider: 'META_CLOUD_API' };
  }
}

/**
 * Webhook Processor: updates delivery status (DELIVERED / READ / FAILED) strictly from Meta webhook
 */
export async function processMetaWebhook(body: any): Promise<void> {
  if (body.object !== 'whatsapp_business_account') return;

  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const val = change.value;
      if (!val) continue;

      // 1. Process Message Status Updates (sent, delivered, read, failed)
      if (Array.isArray(val.statuses)) {
        for (const st of val.statuses) {
          const wamid = st.id;
          const status = String(st.status || '').toUpperCase(); // 'DELIVERED', 'READ', 'FAILED', 'SENT'
          const errorCode = st.errors?.[0]?.code ? String(st.errors[0].code) : undefined;

          // Find across companies
          try {
            const companiesSnap = await adminDb.collection('companies').get();
            for (const comp of companiesSnap.docs) {
              const msgSnap = await comp.ref.collection('messages').where('sid', '==', wamid).limit(1).get();
              if (!msgSnap.empty) {
                await msgSnap.docs[0].ref.update({
                  status,
                  errorCode: errorCode || null,
                  deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : undefined,
                  readAt: status === 'READ' ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString()
                });
              }
            }
          } catch (e: any) {
            console.warn('[Meta Webhook] Status update error:', e.message);
          }
        }
      }

      // 2. Process Inbound Customer Messages
      if (Array.isArray(val.messages)) {
        for (const msg of val.messages) {
          const from = msg.from; // Phone
          const bodyText = (msg.text?.body || '').trim();
          const lowerText = bodyText.toLowerCase();

          try {
            const companiesSnap = await adminDb.collection('companies').get();
            for (const comp of companiesSnap.docs) {
              // Record incoming message to refresh 24h window
              await comp.ref.collection('messages').add({
                to: from,
                from,
                body: bodyText,
                direction: 'INBOUND',
                status: 'RECEIVED',
                timestamp: new Date().toISOString()
              });

              // Check for STOP / UNSUBSCRIBE opt-out
              if (lowerText === 'stop' || lowerText === 'unsubscribe') {
                console.log(`[Meta WhatsApp] Recipient +${from} requested STOP. Recording opt-out...`);
                const recSnap = await comp.ref.collection('whatsapp_recipients')
                  .where('cleanPhone', '==', from).get();
                for (const doc of recSnap.docs) {
                  await doc.ref.update({ optOut: true, optOutAt: new Date().toISOString() });
                }
              }
            }
          } catch (e: any) {
            console.warn('[Meta Webhook] Inbound message handling error:', e.message);
          }
        }
      }
    }
  }
}

/**
 * Legacy alias for updating status
 */
export async function updateMessageStatus(
  companyId: string,
  sid: string,
  status: string,
  errorCode?: string
): Promise<void> {
  try {
    const snap = await adminDb.collection('companies').doc(companyId)
      .collection('messages').where('sid', '==', sid).limit(1).get();
    if (!snap.empty) {
      await snap.docs[0].ref.update({
        status,
        errorCode: errorCode || null,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err: any) {
    console.warn('[Meta WhatsApp] Status update error:', err.message);
  }
}

/**
 * Get recent messages
 */
export async function getMessageLogs(companyId: string, limit = 50): Promise<any[]> {
  try {
    const snap = await adminDb.collection('companies').doc(companyId)
      .collection('messages').orderBy('timestamp', 'desc').limit(limit).get();
    return snap.docs.map(d => d.data());
  } catch {
    return [];
  }
}
