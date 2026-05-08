import { apiClient } from '../config/api.config';

export const submitComplaint = async (formData: FormData) => {
  const response = await apiClient.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyComplaints = async ({ pageParam = 1 }) => {
  const response = await apiClient.get('/complaints/my', {
    params: { page: pageParam },
  });
  return response.data;
};

export const getAdminComplaints = async (filters: { zoneId?: string; status?: string; pageParam?: number }) => {
  const response = await apiClient.get('/complaints/admin/all', {
    params: {
      zone_id: filters.zoneId,
      status: filters.status,
      page: filters.pageParam || 1,
    },
  });
  return response.data;
};

export const updateComplaintStatus = async ({ id, status }: { id: string; status: string }) => {
  const response = await apiClient.patch(`/complaints/admin/${id}/status`, { status });
  return response.data;
};
