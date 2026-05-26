import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/types';

export const categoryService = {
  getAllCategories: async () => {
    return apiClient<Category[]>('/category', {
      requireAuth: false,
    });
  },
};
