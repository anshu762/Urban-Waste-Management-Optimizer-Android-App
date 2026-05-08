import { apiClient } from '../config/api.config';

export interface SubmitWasteLogPayload {
  wasteCategories: string[];
  segregationStatus: 'CORRECT' | 'PARTIAL' | 'NOT_SEGREGATED';
  quantityEstimate?: string;
}

export const submitWasteLog = async (payload: SubmitWasteLogPayload) => {
  const response = await apiClient.post('/waste-logs', payload);
  return response.data;
};

export const getMyLogs = async ({ pageParam = 1 }) => {
  const response = await apiClient.get('/waste-logs/my', {
    params: { page: pageParam },
  });
  return response.data;
};
