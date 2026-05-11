import { supabase } from '../lib/supabaseClient';
import type { Newsletter } from '../types/types';

export const supabaseService = {
  subscribe: async (payload: Omit<Newsletter, 'id'>) => {
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('El email es requerido');
    }

    const { data, error } = await supabase
      .from('newsletter')
      .upsert(
        {
          email: normalizedEmail,
        },
        {
          onConflict: 'email',
          ignoreDuplicates: true,
        },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Newsletter;
  },
};
