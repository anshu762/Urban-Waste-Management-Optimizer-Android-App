import { apiClient } from '../config/api.config';

export const getMyNotifications = async (page: number = 1) => {
  const response = await apiClient.get(`/notifications/my?page=${page}`);
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
};
