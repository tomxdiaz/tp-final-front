import { apiClient } from '../lib/apiClient';
import type { AppUser } from '../types/types';

export const appUserService = {
  getMyAppUser: async (token?: string) => {
    return apiClient<AppUser>('/app_user/me', {
      requireAuth: true,
      token,
    });
  },
};
