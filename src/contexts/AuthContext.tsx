import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import type { Role, User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: Omit<User, 'password'> | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        if (data.is_active === false) {
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        setUser({
          id,
          email,
          fullName: data.full_name || '',
          role: data.role as Role || 'customer',
          is_active: data.is_active,
          created_at: data.created_at
        });
      } else {
        setUser({
          id,
          email,
          fullName: '',
          role: 'customer',
        });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('is_active').eq('id', data.user.id).single();
        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          return { error: 'Your account has been suspended.' };
        }
      }
      return {};
    },
    []
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) return { error: error.message };
      
      // Update profile is usually handled by a database trigger on Supabase,
      // but we fallback here if we need to insert it manually.
      // Assuming the user's db has RLS that lets them insert their own profile 
      // or there's a trigger. If trigger exists, we don't need to do it here.
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role: 'customer'
        });
        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      return {};
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        signIn,
        register,
        signOut,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}