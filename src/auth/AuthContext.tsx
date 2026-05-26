import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AppUser } from '../types/types';

export type AuthContextType = {
  session: Session | null;
  appUser: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  reloadAppUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  appUser: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  reloadAppUser: async () => {},
});
