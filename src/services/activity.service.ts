import { apiClient } from '../lib/apiClient';
import type { Activity, CreateActivityPayload, UpdateActivityPayload } from '../types/types';

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

  getMyActivityById: async (id: number) => {
    return apiClient<Activity>(`/activity/me/${id}`, {
      requireAuth: true,
    });
  },

  getActivitiesByBusinessId: async (id: number) => {
    return apiClient<Activity>(`/activity/business/${id}`, {
      requireAuth: false,
    });
  },

  renewActivitySessions: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}/renew`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  updateActivity: async (id: number, payload: UpdateActivityPayload) => {
    return apiClient<Activity>(`/activity/${id}`, {
      method: 'PATCH',
      body: payload,
      requireAuth: true,
    });
  },

  deleteActivity: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}`, {
      method: 'DELETE',
      requireAuth: true,
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
