import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { submitComplaint, getMyComplaints, getAdminComplaints, updateComplaintStatus } from '../api/complaint.api';

export const useSubmitComplaint = () => {
  return useMutation({
    mutationFn: (formData: FormData) => submitComplaint(formData),
  });
};

export const useMyComplaints = () => {
  return useInfiniteQuery({
    queryKey: ['myComplaints'],
    queryFn: getMyComplaints,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.data.length < lastPage.data.limit) return undefined;
      return lastPage.data.page + 1;
    },
    initialPageParam: 1,
  });
};

export const useAdminComplaints = (filters: { zoneId?: string; status?: string }) => {
  return useInfiniteQuery({
    queryKey: ['adminComplaints', filters],
    queryFn: ({ pageParam = 1 }) => getAdminComplaints({ ...filters, pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.data.length < lastPage.data.limit) return undefined;
      return lastPage.data.page + 1;
    },
    initialPageParam: 1,
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateComplaintStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['myComplaints'] });
    },
  });
};
