import { apiClient } from '../config/api.config';

export const getMyProfileApi = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const getMyRoutesApi = async () => {
  const response = await apiClient.get('/admin/routes/my');
  return response.data;
};
