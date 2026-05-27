import { apiClient } from '../lib/apiClient';
import type { Activity } from '../types/types';

export const activityService = {
  getActivities: async () => {
    return apiClient<Activity[]>('/activity', {
      requireAuth: false,
    });
  },
};
