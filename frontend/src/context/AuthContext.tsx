import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (session: Session): Promise<User | null> => {
      // This retry logic is crucial for the signup flow, where the DB trigger
      // that creates the profile might have a slight delay.
      for (let i = 0; i < 5; i++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // 'PGRST116' means no rows found
          console.error("AuthContext: Error fetching profile.", error);
          return null;
        }
        if (data) {
          return {
            id: data.id,
            email: session.user.email ?? '',
            full_name: data.full_name,
            role: data.role,
          };
        }
        // If no profile found yet, wait and retry.
        await new Promise(res => setTimeout(res, 300 * (i + 1)));
      }
      console.error("AuthContext: Profile not found after multiple retries.");
      toast.error("Could not load user profile. Please try logging in again.");
      return null;
    };

    // Use onAuthStateChange as the single source of truth for the session.
    // It fires immediately on page load with the initial session state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const userProfile = await fetchUserProfile(session);
          setSession(session);
          setUser(userProfile);
        } else {
          setSession(null);
          setUser(null);
        }
        // Set loading to false only after the first auth event has been handled.
        setLoading(false);
      }
    );

    // Cleanup the subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, loading, signOut };

  // Render children only when not loading, or render a global loader.
  // For simplicity, we'll let ProtectedRoute handle the loading UI.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
