import { supabase } from '../lib/supabaseClient';

export const supabaseService = {
  subscribe: async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('El email es requerido');
    }

    const { error } = await supabase.from('newsletter').upsert(
      {
        email: normalizedEmail,
      },
      {
        onConflict: 'email',
        ignoreDuplicates: true,
      },
    );

    if (error) {
      throw error;
    }
  },
};
