import { apiClient } from '../config/api.config';

export const registerApi = async (data: any) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const loginApi = async (data: any) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const getMeApi = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};
