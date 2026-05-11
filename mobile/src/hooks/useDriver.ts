import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfileApi, getMyRoutesApi } from '../api/driver.api';
import { updateRouteStatusApi, updateStopStatusApi } from '../api/route.api';
import { useAuthStore } from '../stores/auth.store';

export const useDriverProfile = () => {
  return useQuery({
    queryKey: ['driverProfile'],
    queryFn: getMyProfileApi,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTodayRoute = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['todayRoute', user?.id],
    queryFn: async () => {
      const result = await getMyRoutesApi();
      const todayStr = new Date().toISOString().split('T')[0];
      const plans = result?.data || [];
      const todayPlan = plans.find((p: any) => {
        const routeDate = p.routeDate?.split('T')[0];
        return routeDate === todayStr;
      });
      return { ...result, data: todayPlan ? [todayPlan] : [] };
    },
    enabled: !!user && user.role === 'DRIVER',
    staleTime: 30 * 1000,
  });
};

export const useDriverRoutes = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['driverRoutes', user?.id],
    queryFn: () => getMyRoutesApi(),
    enabled: !!user && user.role === 'DRIVER',
  });
};

export const useMarkRouteComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => updateRouteStatusApi(id, 'COMPLETED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayRoute'] });
      queryClient.invalidateQueries({ queryKey: ['driverRoutes'] });
    },
  });
};

export const useMarkRouteInProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => updateRouteStatusApi(id, 'IN_PROGRESS'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayRoute'] });
    },
  });
};

export const useUpdateStop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string; data: { status: string; note?: string } }) =>
      updateStopStatusApi(stopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayRoute'] });
    },
  });
};
