/**
 * Telegram Support Bot Service (@kp_support_2026_bot)
 * Integrates node-telegram-bot-api (v2.1.0) with:
 * 1. Gemini 3.8 Flash text auto-reply with multi-turn conversation memory
 * 2. Nano Banana / Imagen image generation (/image, /imagine)
 * 3. Photo editing via user caption instructions
 * 4. Separate daily rate limits (10 messages/min for text, 10 images/day)
 * 5. Owner forwarding (8203364513) & 2-way owner reply forwarding
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Bot, InputFile } = require('node-telegram-bot-api');

import { telegramBotConfig } from '../config/telegramBotConfig.js';
import { generateTelegramAiReply, ChatHistoryMessage } from './telegramAiService.js';
import { generateAiImage, editAiImage } from './telegramImageService.js';

// ─── In-Memory State (Modular for future DB persistence) ─────────────────────

// User message history: userId -> ChatHistoryMessage[] (last 10)
const userHistoryMap = new Map<number, ChatHistoryMessage[]>();

// Text Rate limit: userId -> { count: number, resetTime: number }
const textRateLimitMap = new Map<number, { count: number; resetTime: number }>();

// Image Rate limit: userId -> { count: number, dateStr: string }
const imageRateLimitMap = new Map<number, { count: number; dateStr: string }>();

// Forwarded message mapping: ownerForwardedMessageId -> customerChatId
const ownerReplyMap = new Map<number, number>();

// Bot instance reference
let botInstance: any = null;
let isBotInitialized = false;
let initError: string | null = null;

// ─── Rate Limiting ───────────────────────────────────────────────────────────

function isTextRateLimited(userId: number): boolean {
  const now = Date.now();
  const userRate = textRateLimitMap.get(userId);

  if (!userRate || now > userRate.resetTime) {
    textRateLimitMap.set(userId, { count: 1, resetTime: now + telegramBotConfig.rateLimitWindowMs });
    return false;
  }

  userRate.count++;
  if (userRate.count > telegramBotConfig.rateLimitMaxMessages) {
    return true;
  }

  return false;
}

function isImageRateLimited(userId: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const userRate = imageRateLimitMap.get(userId);

  if (!userRate || userRate.dateStr !== today) {
    imageRateLimitMap.set(userId, { count: 1, dateStr: today });
    return false;
  }

  if (userRate.count >= telegramBotConfig.imageDailyLimit) {
    return true;
  }

  userRate.count++;
  return false;
}

// ─── Conversation History Management ─────────────────────────────────────────

function getUserHistory(userId: number): ChatHistoryMessage[] {
  return userHistoryMap.get(userId) || [];
}

function appendUserHistory(userId: number, role: 'user' | 'model', text: string) {
  const history = getUserHistory(userId);
  history.push({ role, text });
  if (history.length > telegramBotConfig.maxHistoryMessages) {
    history.splice(0, history.length - telegramBotConfig.maxHistoryMessages);
  }
  userHistoryMap.set(userId, history);
}

// ─── Helper to Download Photo from Telegram ──────────────────────────────────

async function downloadPhotoFile(token: string, fileId: string, bot: any): Promise<Buffer | null> {
  try {
    const fileInfo = await bot.api.getFile(fileId);
    if (!fileInfo || !fileInfo.file_path) return null;
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
    const res = await fetch(downloadUrl);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    console.error('[Telegram Bot] Failed downloading photo:', err);
    return null;
  }
}

// ─── Bot Initialization ──────────────────────────────────────────────────────

export function initTelegramBot(): { success: boolean; message: string } {
  const token = (process.env.BOT_TOKEN || '').trim();

  if (!token || token === 'PASTE_NEW_TOKEN_HERE') {
    const msg = '[Telegram Bot] BOT_TOKEN is empty or placeholder in .env. Bot waiting for real token.';
    console.log(msg);
    initError = 'BOT_TOKEN is missing or placeholder';
    return { success: false, message: msg };
  }

  if (isBotInitialized && botInstance) {
    return { success: true, message: 'Bot already running.' };
  }

  const mode = (process.env.BOT_MODE || 'polling').toLowerCase();
  const isPolling = mode === 'polling';

  try {
    botInstance = new Bot(token);
    isBotInitialized = true;
    initError = null;

    console.log(`[Telegram Bot] KP Support Bot initialized in ${mode.toUpperCase()} mode.`);

    // Register Handlers
    registerBotHandlers(botInstance, token);

    // If polling mode, start background long polling
    if (isPolling) {
      botInstance.startPolling().catch((pollErr: any) => {
        console.warn('[Telegram Polling Info]:', pollErr?.message || pollErr);
      });
      console.log('[Telegram Bot] Live polling active for @kp_support_2026_bot');
    }

    return { success: true, message: `Bot started in ${mode} mode.` };
  } catch (err: any) {
    const errMessage = String(err?.message || err);
    console.error('[Telegram Bot] Initialization failed:', errMessage.replace(token, '[REDACTED_TOKEN]'));
    initError = errMessage;
    return { success: false, message: errMessage };
  }
}

// ─── Handlers Setup ──────────────────────────────────────────────────────────

function registerBotHandlers(bot: any, token: string) {
  const ownerId = Number(process.env.OWNER_ID || telegramBotConfig.ownerId);

  // Command: /start
  bot.command('start', async (ctx: any) => {
    const firstName = ctx.from?.first_name || 'Dost';

    const welcomeText =
      `Namaste ${firstName}! 🙏\n\n` +
      `Main **KP Support Bot** hoon, hamari website ka official AI assistant.\n\n` +
      `Aap mujhse:\n` +
      `💬 **Website aur support questions** pooch sakte hain (Hindi/Hinglish/English).\n` +
      `🎨 **AI Images banwa sakte hain:** \`/image <description>\` ya \`/imagine <description>\`\n` +
      `✨ **Photos edit karwa sakte hain:** Photo bhejein aur caption me instruction likhein (jaise "background change karo")!`;

    const validAppUrl =
      process.env.APP_URL && process.env.APP_URL.startsWith('https://')
        ? process.env.APP_URL
        : 'https://t.me/kp_support_2026_bot';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Website Kholein', url: validAppUrl },
          { text: '❓ Madad (/help)', callback_data: 'help_info' },
        ],
      ],
    };

    try {
      await ctx.reply(welcomeText, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } catch (e: any) {
      console.error('[Telegram Bot] Error in /start:', e?.message || e);
    }
  });

  // Command: /help
  bot.command('help', async (ctx: any) => {
    const helpText =
      `🤖 **KP Support Bot Help Desk**\n\n` +
      `• **AI Chat:** Aap apna sawaal seedhe yahan type karke bhejein. Gemini 3.8 Flash turant reply dega.\n` +
      `• **AI Image Generation:**\n` +
      `  \`/image <description>\` ya \`/imagine <description>\` likhein (e.g. \`/image a futuristic sports car at night in neon rain\`).\n` +
      `• **AI Photo Editing:**\n` +
      `  Koi bhi photo bhejein aur caption me instruction likhein (e.g. "make it cyberpunk neon" ya "background hata do").\n` +
      `• **Limits:** Text chat unlimited hai, aur images ke liye daily limit 10 photos/day hai.\n` +
      `• **Owner Support:** Aapka har message direct website owner (${ownerId}) tak bhi monitor hota hai.`;

    try {
      await ctx.reply(helpText, { parse_mode: 'Markdown' });
    } catch (e: any) {
      console.error('[Telegram Bot] Error in /help:', e?.message || e);
    }
  });

  // Commands: /image and /imagine
  const handleImageCommand = async (ctx: any) => {
    const text = ctx.message?.text || '';
    const prompt = text.replace(/^\/(?:image|imagine)\s*/i, '').trim();
    const chatId = ctx.chat.id;

    if (!prompt) {
      await ctx.reply(
        `🎨 Kripya image ka description bhi likhein.\nUdaharan:\n\`/image a royal luxury palace with golden lights\``,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Check image daily rate limit
    if (chatId !== ownerId && isImageRateLimited(chatId)) {
      await ctx.reply(telegramBotConfig.imageLimitReachedMessage);
      return;
    }

    // Send "upload_photo" action while generating
    try {
      await ctx.api.sendChatAction(chatId, 'upload_photo');
    } catch {
      // ignore
    }

    try {
      const result = await generateAiImage(prompt);

      if (result.success && result.buffer) {
        // Send generated image to user
        await ctx.api.sendPhoto(chatId, new InputFile(result.buffer, { filename: 'ai-image.jpg' }), {
          caption: `🎨 **AI Generated Image**\n📝 "${prompt.slice(0, 200)}"`,
          parse_mode: 'Markdown',
        });

        // Forward to Owner (8203364513)
        if (ownerId && chatId !== ownerId) {
          try {
            const customerName = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') || 'Customer';
            const customerUsername = ctx.from?.username ? `@${ctx.from.username}` : 'No username';

            const ownerCaption =
              `🎨 **Nayi Image Request**\n` +
              `👤 **Naam:** ${customerName} (${customerUsername}, ID: ${chatId})\n` +
              `📝 **Prompt:** ${prompt}`;

            await ctx.api.sendPhoto(ownerId, new InputFile(result.buffer, { filename: 'ai-image.jpg' }), {
              caption: ownerCaption,
              parse_mode: 'Markdown',
            });
          } catch (forwardErr) {
            console.error('[Telegram Bot] Image forward to owner failed:', forwardErr);
          }
        }
      } else {
        await ctx.reply(telegramBotConfig.imageFallbackMessage);
        if (ownerId && chatId !== ownerId) {
          await ctx.api.sendMessage(
            ownerId,
            `⚠️ User (ID: ${chatId}) ki image request fail hui:\nPrompt: "${prompt}"\nReason: ${result.error || 'Blocked'}`
          );
        }
      }
    } catch (err: any) {
      console.error('[Telegram Bot] Error generating image:', err);
      await ctx.reply(telegramBotConfig.imageFallbackMessage);
    }
  };

  bot.command('image', handleImageCommand);
  bot.command('imagine', handleImageCommand);

  // General Message Handler (Customer Messages, Photo Editing & Owner Replies)
  bot.on('message', async (ctx: any) => {
    const msg = ctx.message;
    if (!msg) return;

    // Ignore command texts already handled by commands
    if (msg.text?.startsWith('/')) return;

    const chatId = ctx.chat.id;

    // ─────────────────────────────────────────────────────────────────────────
    // Sub-case A: User sent a PHOTO with caption for AI Image Editing
    // ─────────────────────────────────────────────────────────────────────────
    if (msg.photo && msg.photo.length > 0) {
      const caption = msg.caption?.trim();
      const highestResPhoto = msg.photo[msg.photo.length - 1];

      // If no caption, invite the user to provide an edit instruction
      if (!caption) {
        await ctx.reply(
          `📸 Photo mil gayi! Is photo ko edit karne ke liye photo ke sath caption me instruction likhein (jaise: "background change karo", "make it anime", "convert to sketch").`
        );
        return;
      }

      // Check image daily rate limit
      if (chatId !== ownerId && isImageRateLimited(chatId)) {
        await ctx.reply(telegramBotConfig.imageLimitReachedMessage);
        return;
      }

      // Show upload_photo action
      try {
        await ctx.api.sendChatAction(chatId, 'upload_photo');
      } catch {
        // ignore
      }

      try {
        const photoBuffer = await downloadPhotoFile(token, highestResPhoto.file_id, bot);
        if (!photoBuffer) {
          await ctx.reply('Photo download karne me dikkat aayi. Kripya dobara try karein.');
          return;
        }

        const editResult = await editAiImage(photoBuffer, 'image/jpeg', caption);

        if (editResult.success && editResult.buffer) {
          // Send edited photo to user
          await ctx.api.sendPhoto(chatId, new InputFile(editResult.buffer, { filename: 'edited.jpg' }), {
            caption: `✨ **AI Edited Photo**\n📝 Instruction: "${caption.slice(0, 150)}"`,
            parse_mode: 'Markdown',
          });

          // Forward to Owner
          if (ownerId && chatId !== ownerId) {
            try {
              const customerName = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') || 'Customer';
              const customerUsername = ctx.from?.username ? `@${ctx.from.username}` : 'No username';

              const ownerCaption =
                `✨ **Photo Edit Request**\n` +
                `👤 **Naam:** ${customerName} (${customerUsername}, ID: ${chatId})\n` +
                `📝 **Instruction:** ${caption}`;

              await ctx.api.sendPhoto(ownerId, new InputFile(editResult.buffer, { filename: 'edited.jpg' }), {
                caption: ownerCaption,
                parse_mode: 'Markdown',
              });
            } catch (err) {
              console.error('[Telegram Bot] Photo edit forward to owner failed:', err);
            }
          }
        } else {
          await ctx.reply(telegramBotConfig.imageFallbackMessage);
        }
      } catch (editErr) {
        console.error('[Telegram Bot] Photo editing error:', editErr);
        await ctx.reply(telegramBotConfig.imageFallbackMessage);
      }
      return;
    }

    const text = msg.text?.trim();
    if (!text) return;

    // ─────────────────────────────────────────────────────────────────────────
    // Case 1: Message is from the OWNER (ID: 8203364513)
    // ─────────────────────────────────────────────────────────────────────────
    if (chatId === ownerId) {
      // Check if owner is replying to a forwarded customer notification
      if (msg.reply_to_message) {
        const repliedMsgId = msg.reply_to_message.message_id;
        let targetCustomerChatId = ownerReplyMap.get(repliedMsgId);

        // Fallback: If map misses, attempt to extract Customer ID from replied message text or caption
        const searchSource = msg.reply_to_message.text || msg.reply_to_message.caption || '';
        if (!targetCustomerChatId && searchSource) {
          const match = searchSource.match(/ID:\s*(\d+)/);
          if (match && match[1]) {
            targetCustomerChatId = Number(match[1]);
          }
        }

        if (targetCustomerChatId) {
          try {
            await ctx.api.sendMessage(
              targetCustomerChatId,
              `💬 **KP Team Support (Direct Reply):**\n\n${text}`,
              { parse_mode: 'Markdown' }
            );

            await ctx.reply(
              `✅ Aapka reply Customer (ID: ${targetCustomerChatId}) ko bhej diya gaya.`
            );
            return;
          } catch (replyErr: any) {
            console.error('[Telegram Bot] Failed forwarding owner reply to customer:', replyErr?.message || replyErr);
            await ctx.reply(
              `❌ Customer tak message nahi pahunch saka: ${replyErr?.message || 'Unknown error'}`
            );
            return;
          }
        }
      }

      // If owner texted normally: Answer Owner directly with Gemini 3.8 Flash AI!
      try {
        await ctx.api.sendChatAction(chatId, 'typing');
      } catch {
        // ignore
      }

      const ownerHistory = getUserHistory(chatId);
      let ownerAiReply = '';
      try {
        ownerAiReply = await generateTelegramAiReply(text, ownerHistory);
      } catch (aiErr: any) {
        console.error('[Telegram Bot] Owner AI reply error:', aiErr?.message || aiErr);
        ownerAiReply = telegramBotConfig.fallbackMessage;
      }

      appendUserHistory(chatId, 'user', text);
      appendUserHistory(chatId, 'model', ownerAiReply);

      try {
        await ctx.reply(ownerAiReply);
      } catch (err: any) {
        console.error('[Telegram Bot] Failed sending AI reply to owner:', err?.message || err);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Case 2: Message is from a CUSTOMER
    // ─────────────────────────────────────────────────────────────────────────

    // Rate Limit check
    if (isTextRateLimited(chatId)) {
      try {
        await ctx.reply('⚠️ Aapne bohot tezi se messages bheje hain. Kripya 1 minute intezaar karein.');
      } catch {
        // ignore
      }
      return;
    }

    // Show "typing..." action before answering
    try {
      await ctx.api.sendChatAction(chatId, 'typing');
    } catch {
      // ignore
    }

    // Fetch conversation history
    const history = getUserHistory(chatId);

    // Generate AI response
    let aiResponse = '';
    try {
      aiResponse = await generateTelegramAiReply(text, history);
    } catch (aiErr: any) {
      console.error('[Telegram Bot] AI reply error:', aiErr?.message || aiErr);
      aiResponse = telegramBotConfig.fallbackMessage;
    }

    // Store history
    appendUserHistory(chatId, 'user', text);
    appendUserHistory(chatId, 'model', aiResponse);

    // Send AI reply to customer
    try {
      await ctx.reply(aiResponse);
    } catch (sendErr: any) {
      console.error('[Telegram Bot] Failed to send message to user:', sendErr?.message || sendErr);
    }

    // Forward Customer Message + AI Reply to OWNER (8203364513)
    if (ownerId && chatId !== ownerId) {
      try {
        const customerName = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') || 'Customer';
        const customerUsername = ctx.from?.username ? `@${ctx.from.username}` : 'No username';

        const forwardNotice =
          `📩 **Naya Customer Message**\n` +
          `👤 **Naam:** ${customerName} (${customerUsername}, ID: ${chatId})\n` +
          `💬 **Message:** ${text}\n\n` +
          `🤖 **Bot Ka Reply:**\n${aiResponse}\n\n` +
          `*(Customer ko direct jawab dene ke liye is message par 'Reply' karein)*`;

        const sentNotice = await ctx.api.sendMessage(ownerId, forwardNotice, { parse_mode: 'Markdown' });

        // Map owner's message ID to customer chatId for 2-way replying
        if (sentNotice && sentNotice.message_id) {
          ownerReplyMap.set(sentNotice.message_id, chatId);
        }
      } catch (forwardErr) {
        console.error('[Telegram Bot] Forward to owner failed:', forwardErr);
      }
    }
  });

  // Global Error handlers
  bot.catch((err: any) => {
    const errMsg = String(err?.message || err);
    console.warn('[Telegram Bot Error Handler]:', errMsg.replace(/bot\d+:[A-Za-z0-9_-]+/g, 'bot[REDACTED]'));
  });
}

// ─── Webhook & Management Exports ────────────────────────────────────────────

/**
 * Handle incoming Telegram webhook updates in webhook mode.
 */
export async function handleTelegramWebhookUpdate(update: any) {
  if (botInstance && isBotInitialized) {
    await botInstance.handleUpdate(update);
  }
}

/**
 * Configure webhook URL for deployment on Render.
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  if (!botInstance) return false;
  try {
    await botInstance.api.setWebhook(webhookUrl);
    console.log(`[Telegram Bot] Webhook registered at: ${webhookUrl}`);
    return true;
  } catch (err: any) {
    console.error('[Telegram Bot] Set webhook failed:', err?.message || err);
    return false;
  }
}

/**
 * Get live bot status for API and frontend dashboard.
 */
export function getTelegramBotStatus() {
  const token = (process.env.BOT_TOKEN || '').trim();
  const isConfigured = Boolean(token && token !== 'PASTE_NEW_TOKEN_HERE');

  return {
    isConfigured,
    isInitialized: isBotInitialized,
    botName: telegramBotConfig.botName,
    botUsername: telegramBotConfig.botUsername,
    botUrl: telegramBotConfig.botUrl,
    ownerId: process.env.OWNER_ID || telegramBotConfig.ownerId,
    mode: (process.env.BOT_MODE || 'polling').toLowerCase(),
    activeHistoryUsers: userHistoryMap.size,
    modelName: process.env.AI_MODEL || telegramBotConfig.defaultModel,
    imageModel: process.env.IMAGE_MODEL || telegramBotConfig.imageModel,
    error: initError,
  };
}

/**
 * Send automated business intelligence or live call alert to Telegram owner
 */
export async function sendTelegramOwnerNotification(text: string): Promise<boolean> {
  const ownerId = process.env.OWNER_ID || telegramBotConfig.ownerId;
  if (!botInstance || !ownerId) return false;
  try {
    await botInstance.api.sendMessage(ownerId, text, { parse_mode: 'HTML' });
    return true;
  } catch (err: any) {
    try {
      await botInstance.api.sendMessage(ownerId, text);
      return true;
    } catch {
      return false;
    }
  }
}
