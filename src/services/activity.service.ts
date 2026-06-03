import { apiClient } from '../lib/apiClient';
import type { Activity } from '../types/types';

export const activityService = {
  getActivities: async () => {
    return apiClient<Activity[]>('/activity', {
      requireAuth: false,
    });
  },

  getMyBusinessActivities: async () => {
    return apiClient<Activity[]>('/activity/business/me', {
      requireAuth: true,
    });
  },

  getActivityById: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}`, {
      requireAuth: false,
    });
  },
};

// hola