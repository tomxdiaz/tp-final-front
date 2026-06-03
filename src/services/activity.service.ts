import { apiClient } from '../lib/apiClient';
import type { Activity, CreateActivityPayload } from '../types/types';

export const activityService = {
  getActivities: async () => {
    return apiClient<Activity[]>('/activity', {
      requireAuth: false,
    });
  },

  getActivityById: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}`, {
      requireAuth: false,
    });
  },

  createActivity: async (activity: CreateActivityPayload) => {
    return apiClient<Activity[]>('/activity', {
      method: 'POST',
      body: activity,
      requireAuth: true,
    });
  },
};
