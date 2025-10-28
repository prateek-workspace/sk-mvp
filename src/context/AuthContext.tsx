import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (session: Session): Promise<User | null> => {
    // This retry logic is crucial for the signup race condition where the profile
    // might not be available immediately after the user is created.
    for (let i = 0; i < 5; i++) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "exact one row not found"
        console.error('Error fetching profile:', error.message);
        return null; // Don't retry on other errors
      }
      
      if (profile) {
        return {
          id: profile.id,
          email: session.user.email!,
          full_name: profile.full_name,
          role: profile.role,
        };
      }
      
      console.warn(`Profile not found, retrying... (${i + 1}/5)`);
      await new Promise(res => setTimeout(res, 500 * (i + 1)));
    }

    console.error('Failed to fetch profile after multiple retries. Signing out to prevent a broken state.');
    await supabase.auth.signOut();
    return null;
  };

  useEffect(() => {
    setLoading(true);

    // 1. Check for initial session on app load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const userProfile = await fetchUserProfile(session);
        setUser(userProfile);
        setSession(session);
      }
      setLoading(false);
    });

    // 2. Set up a listener for subsequent auth events (SIGN_IN, SIGN_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setSession(null);
        } else if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          setLoading(true);
          const userProfile = await fetchUserProfile(session);
          setUser(userProfile);
          setSession(session);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
