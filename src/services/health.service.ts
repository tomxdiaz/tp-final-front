import { apiClient } from '../lib/apiClient';

export const healthService = {
  health: () => {
    return apiClient('/health', {
      method: 'GET',
    });
  },
};
