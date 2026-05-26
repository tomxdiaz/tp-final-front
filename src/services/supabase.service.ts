import { supabase } from '../lib/supabaseClient';

export const supabaseService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

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
