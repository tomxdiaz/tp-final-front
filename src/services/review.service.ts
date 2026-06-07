import { apiClient } from '../lib/apiClient';
import type { CreateReviewPayload, Review } from '../types/types';

export const reviewService = {
  createReview: async (payload: CreateReviewPayload) => {
    return apiClient<Review>('/review', {
      method: 'POST',
      body: payload,
      requireAuth: true,
    });
  },
};
