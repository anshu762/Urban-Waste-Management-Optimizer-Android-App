import { apiClient } from '../config/api.config';

export interface WasteClassificationResult {
  isWaste: boolean;
  wasteType?: string;
  dustbinColor?: string;
  confidence?: number;
  tip?: string;
  message?: string;
}

export const classifyWaste = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<WasteClassificationResult> => {
  const response = await apiClient.post('/ai/classify-waste', {
    image: base64Image,
    mimeType,
  });
  return response.data.data;
};
