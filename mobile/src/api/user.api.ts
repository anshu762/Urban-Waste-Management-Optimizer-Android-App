import { apiClient } from '../config/api.config';

export const updateProfileApi = async (data: any) => {
  const response = await apiClient.put('/me/profile', data);
  return response.data;
};

export const getDriversApi = async (zoneId?: string) => {
  const response = await apiClient.get('/admin/drivers', { params: { zone_id: zoneId } });
  return response.data;
};

export const updatePushTokenApi = async (pushToken: string | null) => {
  const response = await apiClient.put('/me/push-token', { pushToken });
  return response.data;
};
