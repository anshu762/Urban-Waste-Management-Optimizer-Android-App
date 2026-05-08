import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  generateRouteApi, 
  getRoutePlansApi, 
  getRoutePlanByIdApi, 
  assignRouteApi, 
  updateRouteStatusApi, 
  updateStopStatusApi 
} from '../api/route.api';

export const useRoutePlans = (params: { zoneId: string; date?: string }) => {
  return useQuery({
    queryKey: ['routePlans', params],
    queryFn: () => getRoutePlansApi(params),
    enabled: !!params.zoneId,
  });
};

export const useRoutePlanById = (id: string) => {
  return useQuery({
    queryKey: ['routePlan', id],
    queryFn: () => getRoutePlanByIdApi(id),
    enabled: !!id,
  });
};

export const useGenerateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateRouteApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routePlans', { zoneId: variables.zoneId }] });
    },
  });
};

export const useAssignRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { driverProfileId: string; vehicleId: string } }) => 
      assignRouteApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routePlan', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['routePlans'] });
    },
  });
};

export const useUpdateRouteStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateRouteStatusApi(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routePlan', variables.id] });
    },
  });
};

export const useUpdateStopStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, data }: { stopId: string; data: { status: string; note?: string } }) => 
      updateStopStatusApi(stopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routePlan'] });
    },
  });
};
