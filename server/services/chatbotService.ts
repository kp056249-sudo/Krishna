import { GoogleGenAI } from '@google/genai';

/**
 * DataNexus AI Chatbot Service
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 * - 3 Gemini Keys from environment with Round-Robin load balancing & failover.
 * - Dynamic model selection from process.env.GEMINI_MODEL.
 * - Strict length and safety limits (never leaks keys or raw messages).
 * - Enforces the required DataNexus Persona & System Prompt.
 */

// Round-robin index tracker across server lifetime
let currentKeyIndex = 0;

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: string | { text: string }[];
}

function getGeminiKeys(): string[] {
  const k1 = (process.env.GEMINI_KEY_1 || process.env.AUTONOMOUS_KEY_1 || process.env.GEMINI_API_KEY || '').trim();
  const k2 = (process.env.GEMINI_KEY_2 || process.env.AUTONOMOUS_KEY_2 || process.env.GEMINI_API_KEY_2 || '').trim();
  const k3 = (process.env.GEMINI_KEY_3 || process.env.AUTONOMOUS_KEY_3 || process.env.GEMINI_CHAT_KEY || '').trim();

  const pool = [k1, k2, k3].filter(k => k && k.length > 10 && k !== 'Secret value');
  return pool;
}

const SYSTEM_INSTRUCTION = `Tum DataNexus website ke AI assistant ho. Visitors aur sellers ke har sawaal ka madadgaar jawab do.
- Bhasha: user jis bhasha mein likhe (Hindi, Hinglish, English) usi mein jawab do. Default Hinglish. Tone dostana aur seedha, jaise samajhdar dost samjha raha ho.
- Shuruaat mein chhota reaction ("Bilkul, samajh gaya", "Accha sawaal!") phir seedha kaam ki baat.
- Format: pehle seedha jawab 1-2 line mein, phir *bold heading* ke saath chhote points, zaroorat par 1, 2, 3 steps, code ho to code block, aakhir mein "Dhyan rakhne wali baat" ya "Tip", aur aakhri line mein sirf ek agla sawaal: "Batao to main ... bata doon?". Emoji sirf zaroori jagah (✅ ⚠️ 💡 👍).
- Jawab 1000 characters ke andar rakho. Lamba ho to pehle summary do aur poochho ki detail chahiye ya nahi.
- Sach ka niyam: jo pata na ho uska andaza mat lagao, saaf bolo "Ye mujhe pakka nahi pata". Order, price ya stock ka number tabhi do jab diye gaye DATA mein ho, apni taraf se mat banao.
- Safety: API key, password, token ya kisi ka private data kabhi mat batao. Aisa maangne par vinamrata se mana karo.

DATA (DataNexus System Truth & Products):
- Platform: DataNexus Enterprise E-Commerce OS & Analytics Platform.
- Store Connectors: Shopify, WooCommerce, Amazon SP-API, Shiprocket, Postgres/Supabase SQL.
- Modules:
  1. Consolidated Dashboard: Real-time GMV, Net Profit, RTO %, COD Defense, Ad ROAS.
  2. 8:00 AM WhatsApp Morning Briefing Dispatcher: Automatically delivers verified P&L, delivered orders count, RTO loss amounts and stock alerts via Meta WhatsApp Cloud API.
  3. Logistics Kaizen & 3PL Courier Intelligence: Delhivery, BlueDart, DTDC, Blended SLAs and courier performance scorecard.
  4. RTO ML Predictor & COD Defense: Predicts high-risk return orders and triggers 1-tap OTP verification to prevent fake COD orders.
  5. SQL Studio & AST Guard: Secure read-only SQL engine for complex CTEs and window queries with strict SQL injection prevention.
  6. Telegram Support Bot: AI & Image support bot (@kp_support_2026_bot).
- Store Benchmarks:
  • Total Orders: 10,000 orders
  • Gross GMV: ₹1.45 Cr (₹1,45,20,000)
  • Realized Net Profit Margin: 28.4% (Post-COGS & Delivery)
  • Current RTO Return Rate: 14.3%
  • Reverse logistics drag penalty: ₹210 per RTO order
- Security & Privacy: AES-256-GCM token encryption at rest, SSRF guards, RBAC, strict CSP.`;

export async function processChatbotMessage(
  userMessage: string,
  history: { role: string; content?: string; text?: string }[] = []
): Promise<string> {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    return 'Abhi thoda busy hoon, kuch der baad try karo 🙏';
  }

  // Model name strictly from .env
  const modelName = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();

  // Take only last 6 messages for context
  const recentHistory = (history || []).slice(-6).map(h => ({
    role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
    parts: [{ text: (h.content || h.text || '').substring(0, 1000) }]
  }));

  // Append user message
  const contents = [
    ...recentHistory,
    {
      role: 'user',
      parts: [{ text: userMessage.substring(0, 1000) }]
    }
  ];

  // Try keys round-robin with failover
  const totalKeys = keys.length;
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyToUse = keys[(currentKeyIndex + attempt) % totalKeys];

    try {
      const ai = new GoogleGenAI({ apiKey: keyToUse });
      const generatePromise = ai.models.generateContent({
        model: modelName,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 500,
          temperature: 0.7,
        },
        contents: contents as any
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 7000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      if (response && response.text) {
        // Advance round-robin index for next conversation turn
        currentKeyIndex = (currentKeyIndex + attempt + 1) % totalKeys;
        return response.text.trim();
      }
    } catch (err: any) {
      // Log ONLY error type/code, never log secret keys or full user message
      console.warn(`[Chatbot RoundRobin] Key attempt ${attempt + 1} failed: ${err?.status || err?.code || 'Error'}`);
    }
  }

  // If all keys in the pool failed or hit rate limits
  return 'Abhi thoda busy hoon, kuch der baad try karo 🙏';
}
