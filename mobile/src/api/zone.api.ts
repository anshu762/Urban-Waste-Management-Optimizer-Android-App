import { apiClient } from '../config/api.config';

export const getZonesApi = async () => {
  const response = await apiClient.get('/zones');
  return response.data;
};
