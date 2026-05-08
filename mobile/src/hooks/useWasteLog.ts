import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { submitWasteLog, getMyLogs, SubmitWasteLogPayload } from '../api/wastelog.api';

export const useSubmitWasteLog = () => {
  return useMutation({
    mutationFn: (payload: SubmitWasteLogPayload) => submitWasteLog(payload),
  });
};

export const useMyWasteLogs = () => {
  return useInfiniteQuery({
    queryKey: ['myWasteLogs'],
    queryFn: getMyLogs,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.data.length < lastPage.data.limit) return undefined;
      return lastPage.data.page + 1;
    },
    initialPageParam: 1,
  });
};
