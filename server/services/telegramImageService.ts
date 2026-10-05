/**
 * Telegram Image Generation & Editing Service
 * Powered by Google's Gemini / Imagen Models (Nano Banana / Imagen 3).
 * Supports text-to-image (/image, /imagine) and image editing with user instructions.
 */

import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getAiApiKey(): string {
  return (
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_CHAT_KEY ||
    ''
  ).trim();
}

/**
 * Generate a new image from a text prompt.
 * Uses model specified in process.env.IMAGE_MODEL (default: imagen-3.0-generate-002).
 */
export async function generateAiImage(
  prompt: string
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  const apiKey = getAiApiKey();
  if (!apiKey || apiKey === 'PASTE_GEMINI_KEY_HERE') {
    return { success: false, error: 'API_KEY_MISSING' };
  }

  const modelName = (process.env.IMAGE_MODEL || 'imagen-3.0-generate-002').trim();

  // 1. Primary Attempt: Google GenAI SDK
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: any = await ai.models.generateImages({
      model: modelName,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response?.generatedImages?.[0]?.image?.imageBytes) {
      const base64Bytes = response.generatedImages[0].image.imageBytes;
      const buffer = Buffer.from(base64Bytes, 'base64');
      return { success: true, buffer };
    }
  } catch (sdkErr: any) {
    const errText = String(sdkErr?.message || sdkErr);
    console.warn(`[Telegram Image] SDK attempt failed: ${errText.slice(0, 150)}`);
  }

  // 2. Secondary Attempt: Direct Google AI Studio REST Predict endpoint
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' },
      }),
    });

    if (res.ok) {
      const data: any = await res.json();
      const base64Bytes =
        data?.predictions?.[0]?.bytesBase64Encoded ||
        data?.generatedImages?.[0]?.image?.imageBytes;

      if (base64Bytes) {
        return { success: true, buffer: Buffer.from(base64Bytes, 'base64') };
      }
    } else {
      const errJson: any = await res.json().catch(() => ({}));
      console.warn('[Telegram Image] REST endpoint returned status:', res.status, errJson?.error?.message || '');
    }
  } catch (restErr: any) {
    console.warn('[Telegram Image] REST attempt failed:', restErr?.message || restErr);
  }

  // 3. Fallback Attempt: Try alternative model imagen-3.0-generate-001 if different
  if (modelName !== 'imagen-3.0-generate-001') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response: any = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });
      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        const buffer = Buffer.from(response.generatedImages[0].image.imageBytes, 'base64');
        return { success: true, buffer };
      }
    } catch {
      // ignore
    }
  }

  // 4. Fallback Attempt: Try Nano Banana / Gemini Image model via generateContent
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const nanoModel = genAI.getGenerativeModel({ model: 'nano-banana-pro-preview' });
    const nanoRes = await nanoModel.generateContent(prompt);
    const candidateParts = nanoRes.response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if ((part as any).inlineData?.data) {
        return { success: true, buffer: Buffer.from((part as any).inlineData.data, 'base64') };
      }
    }
  } catch {
    // handled gracefully
  }

  return { success: false, error: 'GENERATION_FAILED' };
}

/**
 * Edit an existing image based on user instruction prompt.
 * Accepts existing image buffer and instruction (e.g. "remove background", "make it vintage").
 */
export async function editAiImage(
  inputBuffer: Buffer,
  mimeType: string,
  instructionPrompt: string
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  const apiKey = getAiApiKey();
  if (!apiKey || apiKey === 'PASTE_GEMINI_KEY_HERE') {
    return { success: false, error: 'API_KEY_MISSING' };
  }

  const modelName = (process.env.IMAGE_MODEL || 'imagen-3.0-generate-002').trim();

  try {
    // Step 1: Use Gemini Multimodal vision to analyze the image content & compose an edited prompt
    const genAI = new GoogleGenerativeAI(apiKey);
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const base64Image = inputBuffer.toString('base64');
    const analysisPrompt =
      `Analyze this image in detail and then write a precise, vivid image generation prompt that depicts this image modified according to the user instruction: "${instructionPrompt}". ` +
      `Output ONLY the final image generation prompt description, with no introductory text or quotes.`;

    const visionResult = await visionModel.generateContent([
      analysisPrompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const refinedPrompt = visionResult.response.text()?.trim() || `${instructionPrompt}, high quality professional edit`;

    // Step 2: Generate the modified image with the refined prompt
    return await generateAiImage(refinedPrompt);
  } catch (err: any) {
    console.error('[Telegram Image Edit] Error:', err?.message || err);
    // Fallback directly to text prompt
    return await generateAiImage(instructionPrompt);
  }
}
