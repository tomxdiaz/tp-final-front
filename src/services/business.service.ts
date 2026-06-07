import { apiClient } from '../lib/apiClient';
import type { Booking, Business, CreateBusinessPayload } from '../types/types';

export const businessService = {
  getMyBusiness: async () => {
    return apiClient<Business>('/business/me', {
      requireAuth: true,
    });
  },

  getMyBusinessBookings: async () => {
    return apiClient<Booking[]>('/business/me/bookings', {
      requireAuth: true,
    });
  },

  getBusinessById: async (id: number) => {
    return apiClient<Business>(`/business/${id}`, {
      requireAuth: false,
    });
  },

  createBusiness: async (business: CreateBusinessPayload) => {
    return apiClient<Business>('/business', {
      method: 'POST',
      body: business,
      requireAuth: true,
    });
  },
};
