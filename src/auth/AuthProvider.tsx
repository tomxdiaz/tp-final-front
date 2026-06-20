import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { supabaseService } from '../services/supabase.service';
import { appUserService } from '../services/app_user.service';
import { businessService } from '../services/business.service';
import { ApiError } from '../lib/apiClient';
import type { AppUser, Business } from '../types/types';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAppUser = async (currentSession: Session | null) => {
    if (!currentSession) {
      setAppUser(null);
      setBusiness(null);
      return;
    }

    const currentAppUser = await appUserService.getMyAppUser();
    setAppUser(currentAppUser);
    businessService.getMyBusiness().then(setBusiness).catch(() => setBusiness(null));
  };

  const reloadAppUser = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    await loadAppUser(currentSession);
  };

  const reloadBusiness = async () => {
    businessService.getMyBusiness().then(setBusiness).catch(() => setBusiness(null));
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
    setBusiness(null);
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
        console.error('Error loading app user:', error instanceof ApiError ? error.data : error);
        setAppUser(null);
        if (error instanceof ApiError && error.status === 401) {
          await supabase.auth.signOut();
          if (mounted) setSession(null);
        }
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
          console.error('Error loading app user:', error instanceof ApiError ? error.data : error);
          setAppUser(null);
          if (error instanceof ApiError && error.status === 401) {
            await supabase.auth.signOut();
            if (mounted) setSession(null);
          }
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
        business,
        loading,
        isAuthenticated: Boolean(session),
        signIn,
        signUp,
        signOut,
        reloadAppUser,
        reloadBusiness,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
