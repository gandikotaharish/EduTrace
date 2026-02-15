import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'student' | 'teacher' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  userName: string | null;
  forcePasswordReset: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clearForcePasswordReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserDetails = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      } else if (roleData) {
        setUserRole(roleData.role as UserRole);
      }

      // Fetch profile (including is_active and force_password_reset)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, is_active, force_password_reset')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setUserName(profileData.full_name);
        setForcePasswordReset(profileData.force_password_reset === true);
        if (profileData.is_active === false) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setUserRole(null);
          setUserName(null);
          toast({ title: 'Account disabled', description: 'Your account has been deactivated. Contact your administrator.', variant: 'destructive' });
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchUserDetails(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setUserName(null);
          setForcePasswordReset(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserDetails(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      let message = error.message;
      if (error.message === 'Invalid login credentials') {
        message = 'Invalid email or password. Please try again.';
      }
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserName(null);
    setForcePasswordReset(false);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const clearForcePasswordReset = async () => {
    if (!user?.id) return;
    await supabase.from('profiles').update({ force_password_reset: false, password_changed_at: new Date().toISOString() }).eq('user_id', user.id);
    setForcePasswordReset(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      userName,
      forcePasswordReset,
      loading,
      signUp,
      signIn,
      signOut,
      clearForcePasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
