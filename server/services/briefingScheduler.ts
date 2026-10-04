import cron from 'node-cron';
import { DateTime } from 'luxon';
import { generateWhatsAppExecutiveSummary } from './geminiService.js';
import { sendWhatsAppMessage } from './whatsappService.js';
import { adminDb, recordAuditLog } from '../firestoreService.js';

/**
 * DataNexus Persistent 8:00 AM Scheduler
 */

export async function executeDailyBriefing(companyId: string, specificPhone?: string) {
  try {
    const compRef = adminDb.collection('companies').doc(companyId);
    const [ordersSnap, storesSnap, stateDoc, recipientsSnap] = await Promise.all([
      compRef.collection('orders').get(),
      compRef.collection('stores').get(),
      compRef.collection('whatsapp').doc('state').get(),
      compRef.collection('whatsapp_recipients').get()
    ]);

    const state = stateDoc.data();
    if (state && state.dailyBriefingEnabled === false && !specificPhone) return;

    const orders = ordersSnap.docs.map(d => d.data());
    
    // Financials
    const totalGmv = orders.reduce((sum, o) => sum + (o.totalAmount || o.orderTotal || 0), 0);
    const netProfit = Math.round(totalGmv * 0.28);
    const rtoCount = orders.filter(o => String(o.status).includes('RTO')).length;
    const rtoRate = orders.length > 0 ? (rtoCount / orders.length) * 100 : 0;

    const summaryText = await generateWhatsAppExecutiveSummary({
      date: DateTime.now().setZone('Asia/Kolkata').toFormat('cccc, dd LLL yyyy'),
      totalGmv,
      netProfit,
      orderCount: orders.length,
      rtoRate,
      roas: 4.8,
      stockoutAlerts: []
    });

    let targetPhones: string[] = [];
    if (specificPhone) {
      targetPhones = [specificPhone];
    } else if (!recipientsSnap.empty) {
      targetPhones = recipientsSnap.docs
        .map(d => d.data())
        .filter(r => r.active !== false && r.alerts?.dailyBriefing !== false)
        .map(r => r.cleanPhone || r.phone);
    }

    if (targetPhones.length === 0) {
      targetPhones = [state?.targetPhone || process.env.FOUNDER_WHATSAPP_PHONE || '+919250509070'];
    }

    // Deduplicate
    targetPhones = Array.from(new Set(targetPhones));

    for (const phone of targetPhones) {
      const result = await sendWhatsAppMessage(companyId, phone, summaryText, { type: 'SCHEDULED_BRIEFING' });
      await recordAuditLog(companyId, 'SYSTEM', 'BRIEFING_DISPATCHED', `8:00 AM Briefing sent to ${phone}. Status: ${result.status}`);
    }

    await compRef.collection('whatsapp').doc('state').set({
      lastSent: new Date().toISOString(),
      recipientsCount: targetPhones.length
    }, { merge: true });

  } catch (err: any) {
    console.error(`[Scheduler] Daily briefing failed for ${companyId}:`, err.message);
  }
}

/**
 * Initialize Cron jobs for all companies
 */
export function initBriefingScheduler() {
  console.log('[Scheduler] Initializing DataNexus 8:00 AM IST Cron...');

  // Run every day at 8:00 AM Asia/Kolkata
  // Cron syntax: minute hour dayOfMonth month dayOfWeek
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Triggering 8:00 AM IST global dispatches...');
    
    // In a multi-tenant real app, we would loop through active companies
    // For this build, we use the primary companyId
    const companiesSnap = await adminDb.collection('companies').get();
    for (const doc of companiesSnap.docs) {
      await executeDailyBriefing(doc.id);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
}
