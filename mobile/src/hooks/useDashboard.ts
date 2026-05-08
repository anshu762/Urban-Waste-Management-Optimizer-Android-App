import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsApi, getWeeklyLogVolumeApi, getCategoryBreakdownApi } from '../api/dashboard.api';

export const useDashboardStats = (filters: { zone_id?: string; from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['dashboardStats', filters],
    queryFn: () => getDashboardStatsApi(filters),
  });
};

export const useWeeklyLogVolume = (zone_id?: string) => {
  return useQuery({
    queryKey: ['weeklyLogVolume', zone_id],
    queryFn: () => getWeeklyLogVolumeApi(zone_id),
  });
};

export const useCategoryBreakdown = (filters: { zone_id?: string; from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['categoryBreakdown', filters],
    queryFn: () => getCategoryBreakdownApi(filters),
  });
};
