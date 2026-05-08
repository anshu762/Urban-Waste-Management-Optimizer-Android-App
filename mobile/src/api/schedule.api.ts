import { apiClient } from '../config/api.config';

export const getSchedulesByZone = async (zoneId: string) => {
  const response = await apiClient.get(`/schedules?zone_id=${zoneId}`);
  return response.data;
};

export const getUpcomingPickups = async (zoneId: string) => {
  const response = await apiClient.get(`/schedules/upcoming?zone_id=${zoneId}`);
  return response.data;
};

export const createSchedule = async (data: any) => {
  const response = await apiClient.post('/schedules', data);
  return response.data;
};

export const updateSchedule = async (id: string, data: any) => {
  const response = await apiClient.put(`/schedules/${id}`, data);
  return response.data;
};

export const deleteSchedule = async (id: string) => {
  const response = await apiClient.delete(`/schedules/${id}`);
  return response.data;
};
