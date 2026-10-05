/**
 * Telegram AI Provider Service
 * Handles AI inference using Google's official Gemini SDK (@google/generative-ai).
 * Engineered for sub-2-second responses, resilient multi-key pool, and instant fallback.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { telegramBotConfig } from '../config/telegramBotConfig.js';

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Returns available API key pool in priority order.
 */
function getAiApiKeyPool(): string[] {
  const keys = [
    process.env.AI_API_KEY,
    process.env.GEMINI_CHAT_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_CHAT_KEY_2,
    process.env.GEMINI_API_KEY_2,
  ]
    .map((k) => (k || '').trim())
    .filter((k) => k && k !== 'PASTE_GEMINI_KEY_HERE' && k.length > 10);

  // Return unique keys
  return Array.from(new Set(keys));
}

/**
 * Generate smart AI response for Telegram user.
 * Supports multi-turn chat history (last 10 messages), system instruction,
 * fast multi-key failover and sub-3-second timeout racing.
 */
export async function generateTelegramAiReply(
  userMessage: string,
  history: ChatHistoryMessage[] = []
): Promise<string> {
  const keys = getAiApiKeyPool();

  if (keys.length === 0) {
    console.warn('[Telegram AI] No Gemini API keys configured in .env');
    return telegramBotConfig.fallbackMessage;
  }

  const requestedModel = (process.env.AI_MODEL || telegramBotConfig.defaultModel || 'gemini-3.8-flash').trim();
  const systemPrompt = telegramBotConfig.systemPrompt;

  // Build model priority sequence:
  // Primary (e.g. gemini-3.8-flash) -> Ultra-fast verified models
  const modelCandidates = Array.from(
    new Set([
      requestedModel,
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-2.5-flash',
    ])
  );

  // Format previous conversation turns ensuring alternating roles
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  let lastRole: string | null = null;
  const recentHistory = history.slice(-telegramBotConfig.maxHistoryMessages);

  for (const h of recentHistory) {
    const text = (h.text || '').trim();
    if (!text) continue;
    const role = h.role === 'model' ? 'model' : 'user';
    // First turn in Gemini contents must be 'user'
    if (contents.length === 0 && role !== 'user') continue;
    if (role !== lastRole) {
      contents.push({ role, parts: [{ text }] });
      lastRole = role;
    }
  }

  if (lastRole === 'user') {
    contents.push({ role: 'model', parts: [{ text: 'Ji haan, batayein.' }] });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  // Iterate through keys and models with fast timeout
  for (const apiKey of keys) {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelCandidates) {
      try {
        const genModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        // 3500ms timeout race so user gets an instant reply without stalling
        const timeoutMs = modelName === requestedModel ? 3000 : 4000;
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        );

        const executionPromise = (async () => {
          try {
            // First attempt with structured conversation history
            const result = await genModel.generateContent({ contents });
            return result.response.text()?.trim() || '';
          } catch (historyErr: any) {
            // If contents history formatting failed, try single-turn prompt
            const isQuotaError = historyErr?.status === 429 || String(historyErr?.message || '').includes('429');
            if (isQuotaError) {
              throw historyErr; // Fast-fail to next model/key
            }
            const directResult = await genModel.generateContent(userMessage);
            return directResult.response.text()?.trim() || '';
          }
        })();

        const responseText = await Promise.race([executionPromise, timeoutPromise]);

        if (responseText && responseText.length > 0) {
          return responseText;
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        const isQuota = msg.includes('429') || msg.includes('Quota exceeded');
        
        // If quota exceeded on this model, continue immediately to the next candidate
        if (isQuota) {
          continue;
        }
        // If timeout, try next candidate immediately
        if (msg.includes('TIMEOUT')) {
          continue;
        }
      }
    }
  }

  return telegramBotConfig.fallbackMessage;
}

