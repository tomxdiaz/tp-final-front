import { apiClient } from '../lib/apiClient';
import type { Newsletter } from '../types/types';

export const newsletterService = {
  suscribe: (payload: Omit<Newsletter, 'id'>) => {
    return apiClient<Newsletter>('/newsletter/subscribe', {
      method: 'POST',
      body: payload,
    });
  },
};
