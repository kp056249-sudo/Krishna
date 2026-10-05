import { api } from './apiClient';

/**
 * Server-Side AI Copilot Service
 * All AI requests pass securely through the authenticated backend proxy route (/api/ai/chat)
 * Secrets stay strictly on the server; no API keys stored in client localStorage.
 */
export async function askDataNexusCopilot(userPrompt: string, model?: string): Promise<string> {
  const res = await api.post('/api/ai/chat', { prompt: userPrompt, model });

  if (res.success && res.answer) {
    return res.answer;
  }

  if (res.error) {
    return `⚠️ ${res.error}`;
  }

  return "I don't have that data in your database yet. Please sync your store or import orders.";
}

export async function askDataNexusCopilotWithMeta(
  userPrompt: string,
  model?: string
): Promise<{ answer: string; modelUsed: string; keyUsed: number }> {
  const res = await api.post('/api/ai/chat', { prompt: userPrompt, model });
  return {
    answer: res.answer || (res.error ? `⚠️ ${res.error}` : "I don't have that data in your database yet."),
    modelUsed: res.modelUsed || model || 'gemini-3.8-flash',
    keyUsed: res.keyUsed || 1,
  };
}

export async function convertNlToSql(userPrompt: string): Promise<{ sql: string; explanation: string }> {
  try {
    const res = await api.post('/api/sql/translate', { prompt: userPrompt });
    if (res.success && res.sql && res.explanation) {
      return {
        sql: res.sql,
        explanation: res.explanation,
      };
    }
  } catch (err) {
    console.error('AI translation failed on client side:', err);
  }

  // Fallback default query if anything fails
  return {
    sql: `SELECT * FROM orders LIMIT 20;`,
    explanation: 'Fallback query displaying top live orders from Firestore database.',
  };
}
