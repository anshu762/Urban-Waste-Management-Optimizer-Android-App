import { apiClient } from '../config/api.config';

export const generateRouteApi = async (data: { zoneId: string; date?: string }) => {
  const response = await apiClient.post('/admin/routes/generate', data);
  return response.data;
};

export const getRoutePlansApi = async (params: { zoneId: string; date?: string }) => {
  const response = await apiClient.get('/admin/routes', { params });
  return response.data;
};

export const getRoutePlanByIdApi = async (id: string) => {
  const response = await apiClient.get(`/admin/routes/${id}`);
  return response.data;
};

export const assignRouteApi = async (id: string, data: { driverProfileId: string; vehicleId: string }) => {
  const response = await apiClient.post(`/admin/routes/${id}/assign`, data);
  return response.data;
};

export const updateRouteStatusApi = async (id: string, status: string) => {
  const response = await apiClient.put(`/admin/routes/${id}/status`, { status });
  return response.data;
};

export const updateStopStatusApi = async (stopId: string, data: { status: string; note?: string }) => {
  const response = await apiClient.put(`/admin/routes/stop/${stopId}/status`, data);
  return response.data;
};
