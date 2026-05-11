import { apiClient } from '../config/api.config';

export const getDashboardStatsApi = async (params: { zone_id?: string; from?: string; to?: string }) => {
  const response = await apiClient.get('/admin/dashboard', { params });
  return response.data;
};

export const getWeeklyLogVolumeApi = async (zone_id?: string) => {
  const response = await apiClient.get('/admin/dashboard/weekly-logs', { params: { zone_id } });
  return response.data;
};

export const getCategoryBreakdownApi = async (params: { zone_id?: string; from?: string; to?: string }) => {
  const response = await apiClient.get('/admin/dashboard/category-breakdown', { params });
  return response.data;
};

export const exportDashboardCsvApi = async (params: { zone_id?: string; from?: string; to?: string }) => {
  const response = await apiClient.get('/admin/dashboard/export', {
    params,
    responseType: 'text',
  });
  return response.data as string;
};
