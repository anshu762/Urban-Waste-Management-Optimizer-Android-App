import { apiClient } from '../config/api.config';

export const getZoneSensorSummaryApi = async (zoneId: string) => {
  const response = await apiClient.get(`/admin/iot/zone/${zoneId}`);
  return response.data;
};

export const getResidentZoneSensorSummaryApi = async (zoneId: string) => {
  const response = await apiClient.get(`/iot/zone/${zoneId}`);
  return response.data;
};

export const generateMockSensorDataApi = async (zoneId: string) => {
  const response = await apiClient.post(`/admin/iot/mock/${zoneId}`);
  return response.data;
};
