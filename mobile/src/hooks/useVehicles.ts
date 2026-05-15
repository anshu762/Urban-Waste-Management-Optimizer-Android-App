import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehiclesApi, createVehicleApi, updateVehicleApi, deleteVehicleApi } from '../api/vehicle.api';

export const useVehicles = (include_inactive = false, zoneId?: string) => {
  return useQuery({
    queryKey: ['vehicles', include_inactive, zoneId],
    queryFn: () => getVehiclesApi(include_inactive, zoneId),
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVehicleApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
