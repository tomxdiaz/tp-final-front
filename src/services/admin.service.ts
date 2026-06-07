import { apiClient } from '../lib/apiClient';
import type { Business } from '../types/types';

export const adminService = {
  getAllBusinesses: async () => {
    return apiClient<Business[]>('/admin/business', {
      requireAuth: true,
    });
  },

  verifyBusiness: async (id: number) => {
    return apiClient<Business>(`/admin/business/${id}/verify`, {
      method: 'PATCH',
      requireAuth: true,
    });
  },

  deactivateBusiness: async (id: number) => {
    return apiClient<Business>(`/admin/business/${id}/deactivate`, {
      method: 'PATCH',
      requireAuth: true,
    });
  },
};
