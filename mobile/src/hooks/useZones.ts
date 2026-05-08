import { useQuery } from '@tanstack/react-query';
import { getZonesApi } from '../api/zone.api';

export const useZones = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => getZonesApi(),
  });
};
