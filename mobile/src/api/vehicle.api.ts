import { apiClient } from '../config/api.config';

export const getVehiclesApi = async (include_inactive = false) => {
  const response = await apiClient.get('/admin/vehicles', { params: { include_inactive } });
  return response.data;
};

export const createVehicleApi = async (data: any) => {
  const response = await apiClient.post('/admin/vehicles', data);
  return response.data;
};

export const updateVehicleApi = async (id: string, data: any) => {
  const response = await apiClient.put(`/admin/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicleApi = async (id: string) => {
  const response = await apiClient.delete(`/admin/vehicles/${id}`);
  return response.data;
};
