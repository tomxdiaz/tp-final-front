import { apiClient } from '../lib/apiClient';
import type { AppUser } from '../types/types';

export interface UpdateAppUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const appUserService = {
  getMyAppUser: async (token?: string) => {
    return apiClient<AppUser>('/app_user/me', {
      requireAuth: true,
      token,
    });
  },

  updateMyAppUser: async (dto: UpdateAppUserDto) => {
    return apiClient<AppUser>('/app_user/me', {
      method: 'PATCH',
      body: dto,
      requireAuth: true,
    });
  },
};
