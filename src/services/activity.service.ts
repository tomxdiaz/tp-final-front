import { apiClient } from '../lib/apiClient';
import type { Activity, CreateActivityPayload, ReviewEligibility, SessionDetail, UpdateActivityPayload } from '../types/types';

function buildCreateFormData(payload: CreateActivityPayload): FormData {
  const fd = new FormData();
  fd.append('title', payload.title);
  if (payload.description) fd.append('description', payload.description);
  fd.append('category_id', String(payload.category_id));
  fd.append('starting_hour', payload.starting_hour);
  if (payload.location) fd.append('location', payload.location);
  if (payload.meeting_point) fd.append('meeting_point', payload.meeting_point);
  if (payload.latitude != null) fd.append('latitude', String(payload.latitude));
  if (payload.longitude != null) fd.append('longitude', String(payload.longitude));
  if (payload.difficulty) fd.append('difficulty', payload.difficulty);
  if (payload.duration_minutes != null) fd.append('duration_minutes', String(payload.duration_minutes));
  fd.append('base_price', String(payload.base_price));
  fd.append('currency', payload.currency ?? 'ARS');
  payload.days_of_week.forEach((day) => fd.append('days_of_week', String(day)));
  if (payload.min_age != null) fd.append('min_age', String(payload.min_age));
  if (payload.max_participants != null) fd.append('max_participants', String(payload.max_participants));
  payload.images?.forEach((file) => fd.append('images', file));
  return fd;
}

function buildUpdateFormData(payload: UpdateActivityPayload): FormData {
  const fd = new FormData();
  if (payload.title) fd.append('title', payload.title);
  if (payload.description) fd.append('description', payload.description);
  if (payload.category_id != null) fd.append('category_id', String(payload.category_id));
  if (payload.starting_hour) fd.append('starting_hour', payload.starting_hour);
  if (payload.location) fd.append('location', payload.location);
  if (payload.meeting_point) fd.append('meeting_point', payload.meeting_point);
  if (payload.latitude != null) fd.append('latitude', String(payload.latitude));
  if (payload.longitude != null) fd.append('longitude', String(payload.longitude));
  if (payload.difficulty) fd.append('difficulty', payload.difficulty);
  if (payload.duration_minutes != null) fd.append('duration_minutes', String(payload.duration_minutes));
  if (payload.base_price != null) fd.append('base_price', String(payload.base_price));
  if (payload.currency) fd.append('currency', payload.currency);
  payload.days_of_week?.forEach((day) => fd.append('days_of_week', String(day)));
  if (payload.min_age != null) fd.append('min_age', String(payload.min_age));
  payload.existingImages?.forEach((url) => fd.append('existingImages', url));
  payload.images?.forEach((file) => fd.append('images', file));
  return fd;
}

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

  getReviewEligibility: async (id: number) => {
    return apiClient<ReviewEligibility>(`/activity/${id}/review-eligibility`, {
      requireAuth: true,
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

  createActivity: async (payload: CreateActivityPayload) => {
    return apiClient<Activity[]>('/activity', {
      method: 'POST',
      body: buildCreateFormData(payload),
      requireAuth: true,
    });
  },

  updateActivity: async (id: number, payload: UpdateActivityPayload) => {
    return apiClient<Activity>(`/activity/${id}`, {
      method: 'PATCH',
      body: buildUpdateFormData(payload),
      requireAuth: true,
    });
  },

  deleteActivity: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },

  deactivateActivity: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}/deactivate`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  activateActivity: async (id: number) => {
    return apiClient<Activity>(`/activity/${id}/activate`, {
      method: 'POST',
      requireAuth: true,
    });
  },

  getSessionDetail: async (activityId: number, sessionId: number) => {
    return apiClient<SessionDetail>(`/activity/${activityId}/session/${sessionId}`, {
      requireAuth: true,
    });
  },
};
