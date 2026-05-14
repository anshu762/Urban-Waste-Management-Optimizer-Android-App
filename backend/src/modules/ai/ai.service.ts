import { GoogleGenAI, createPartFromBase64, createPartFromText } from '@google/genai';
import { config } from '../../config';
import { WasteResult } from './ai.schema';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

const WASTE_CLASSIFICATION_PROMPT = `Analyze the given image and determine if it contains waste material.

If waste is detected, classify it strictly into one of these categories:
- Liquid Waste
- Solid Waste
- Organic Waste
- Recyclable Waste
- Hazardous Waste

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "isWaste": true,
  "wasteType": "Organic Waste",
  "dustbinColor": "Green",
  "confidence": 92,
  "tip": "Dispose with biodegradable waste"
}

If the image does not contain waste or is unclear:
{
  "isWaste": false,
  "message": "No waste detected clearly in the image"
}

Confidence must be an integer between 0 and 100.`;

const FALLBACK_RESULT: WasteResult = {
  isWaste: false,
  message: 'Could not analyze the image. Please try again.',
};

export const classifyWasteImage = async (base64Image: string, mimeType: string): Promise<WasteResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        createPartFromText(WASTE_CLASSIFICATION_PROMPT),
        createPartFromBase64(base64Image, mimeType),
      ],
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return FALLBACK_RESULT;

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.isWaste !== 'boolean') return FALLBACK_RESULT;

    if (!parsed.isWaste) {
      return { isWaste: false, message: parsed.message || 'No waste detected' };
    }

    const result: WasteResult = {
      isWaste: true,
      wasteType: parsed.wasteType || 'Unknown',
      dustbinColor: parsed.dustbinColor || 'Unknown',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      tip: parsed.tip || 'Dispose responsibly',
    };

    if ((result.confidence ?? 0) < 60) {
      return {
        isWaste: false,
        message: `Could not identify waste clearly (confidence: ${result.confidence}%). Try with better lighting and a closer image.`,
      };
    }

    return result;
  } catch (error) {
    console.error('Gemini classification error:', error);
    return FALLBACK_RESULT;
  }
};
