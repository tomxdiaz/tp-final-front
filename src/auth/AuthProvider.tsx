import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { supabaseService } from '../services/supabase.service';
import { appUserService } from '../services/app_user.service';
import type { AppUser } from '../types/types';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAppUser = async (currentSession: Session | null) => {
    if (!currentSession) {
      setAppUser(null);
      return;
    }

    const currentAppUser = await appUserService.getMyAppUser();
    setAppUser(currentAppUser);
  };

  const reloadAppUser = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    await loadAppUser(currentSession);
  };

  const signIn = async (email: string, password: string) => {
    await supabaseService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await supabaseService.signUp(email, password);
  };

  const signOut = async () => {
    await supabaseService.signOut();
    setSession(null);
    setAppUser(null);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setLoading(true);

      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting Supabase session:', error);
      }

      if (!mounted) return;

      setSession(initialSession);

      try {
        await loadAppUser(initialSession);
      } catch (error) {
        console.error('Error loading app user:', error);
        setAppUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      setTimeout(async () => {
        if (!mounted) return;

        setLoading(true);

        try {
          await loadAppUser(newSession);
        } catch (error) {
          console.error('Error loading app user:', error);
          setAppUser(null);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        appUser,
        loading,
        isAuthenticated: Boolean(session),
        signIn,
        signUp,
        signOut,
        reloadAppUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
