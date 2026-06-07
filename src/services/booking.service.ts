import { apiClient } from '../lib/apiClient';
import type { Booking, CreateBookingPayload } from '../types/types';

export const bookingService = {
  createBooking: async (booking: CreateBookingPayload) => {
    return apiClient<Booking>('/booking', {
      method: 'POST',
      body: booking,
      requireAuth: true,
    });
  },

  getAllMyBookings: async () => {
    return apiClient<Booking>('/booking/my', {
      requireAuth: true,
    });
  },

  getBookingById: async (id: number) => {
    return apiClient<Booking>(`/booking/${id}`, {
      requireAuth: true,
    });
  },

  cancelBooking: async (id: number) => {
    return apiClient<Booking>(`/booking/${id}/cancel`, {
      method: 'POST',
      requireAuth: true,
    });
  },
};
