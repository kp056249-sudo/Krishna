/**
 * Telegram Support Bot Configuration
 * Settings, defaults, and editable system prompt for KP Support Bot (@kp_support_2026_bot).
 */

export interface TelegramBotSettings {
  botName: string;
  botUsername: string;
  botUrl: string;
  ownerId: string;
  defaultModel: string;
  imageModel: string;
  systemPrompt: string;
  rateLimitMaxMessages: number;
  rateLimitWindowMs: number;
  maxHistoryMessages: number;
  fallbackMessage: string;
  imageDailyLimit: number;
  imageFallbackMessage: string;
  imageLimitReachedMessage: string;
}

export const telegramBotConfig: TelegramBotSettings = {
  botName: 'KP Support Bot',
  botUsername: 'kp_support_2026_bot',
  botUrl: 'https://t.me/kp_support_2026_bot',
  ownerId: process.env.OWNER_ID || '8203364513',
  defaultModel: process.env.AI_MODEL || 'gemini-3.8-flash',
  imageModel: process.env.IMAGE_MODEL || 'imagen-3.0-generate-002',

  // System prompt as specified by user:
  systemPrompt:
    process.env.TELEGRAM_SYSTEM_PROMPT ||
    'Tum KP Support Bot ho, hamari website DataNexus ke official smart assistant. Tumhe har sawaal ka sahi, intelligent aur helpful jawab dena hai. User jis bhasha me likhe (Hindi/Hinglish/English) usi me dosti bhare, saaf aur accurate jawab do. Agar website owner (KP ji, ID 8203364513) baat karein toh unhe founder/owner ke roop me samman aur highest level executive assistance do. Agar kisi aisi specific internal cheez ka jawab na pata ho jiska data tumhare paas na ho, toh jhooth mat bolo, kaho ki team jaldi contact karegi.',

  // Safety & Reliability - Text Chat
  rateLimitMaxMessages: 10, // Max 10 messages
  rateLimitWindowMs: 60 * 1000, // per 1 minute
  maxHistoryMessages: 10, // Keep last 10 messages per user

  // Fallback if AI service encounters an issue
  fallbackMessage: 'Abhi thodi dikkat hai, hum jaldi reply karenge.',

  // Image Generation & Editing Limits
  imageDailyLimit: 10, // 1 user max 10 images per day
  imageFallbackMessage:
    'Maaf kijiye, is description ke liye image generate nahi ho saki ya safety policy ki wajah se block ho gayi. Kripya doosra description try karein.',
  imageLimitReachedMessage:
    'Aapki aaj ki 10 images ki daily limit poori ho gayi hai. Kal dobara try karein!',
};
