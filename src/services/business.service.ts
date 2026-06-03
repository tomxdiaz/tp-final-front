import { apiClient } from '../lib/apiClient';
import type { Business } from '../types/types';

export type BusinessProfileSummary = {
  business: Business;
  review_summary: {
    average_rating: number;
    total_reviews: number;
    five_star_percentage: number;
    four_star_percentage: number;
    three_star_percentage: number;
    two_star_percentage: number;
    one_star_percentage: number;
  };
  activities: Array<{
    id: number;
    title: string;
    is_active: boolean;
    average_rating: number;
    review_count: number;
  }>;
  latest_reviews: Array<{
    rating: number;
    comment: string | null;
    activity_title: string;
    created_at: string;
  }>;
  years_of_experience: number;
};

export const businessService = {
  getMyBusiness: async () => {
    return apiClient<Business>('/business/me', {
      requireAuth: true,
    });
  },

  getMyProfileSummary: async () => {
    return apiClient<BusinessProfileSummary>('/business/me/summary', {
      requireAuth: true,
    });
  },
};