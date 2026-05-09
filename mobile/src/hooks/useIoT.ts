import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateMockSensorDataApi, getResidentZoneSensorSummaryApi, getZoneSensorSummaryApi } from '../api/iot.api';

export const useZoneSensorSummary = (zoneId?: string) => {
  return useQuery({
    queryKey: ['iotZoneSummary', zoneId],
    queryFn: () => getZoneSensorSummaryApi(zoneId!),
    enabled: !!zoneId,
    refetchInterval: 30000,
  });
};

export const useGenerateMockSensorData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneId: string) => generateMockSensorDataApi(zoneId),
    onSuccess: (_, zoneId) => {
      queryClient.invalidateQueries({ queryKey: ['iotZoneSummary', zoneId] });
    },
  });
};

export const useResidentZoneSensorSummary = (zoneId?: string) => {
  return useQuery({
    queryKey: ['residentIotZoneSummary', zoneId],
    queryFn: () => getResidentZoneSensorSummaryApi(zoneId!),
    enabled: !!zoneId,
    refetchInterval: 30000,
  });
};
