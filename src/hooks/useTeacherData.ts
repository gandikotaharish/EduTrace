import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type StudentProfile = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

export function useAllStudents() {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-students'],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      // Get all users with student role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');
      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) return [];

      const studentIds = roles.map((r) => r.user_id);

      // Get profiles for those students
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, created_at')
        .in('user_id', studentIds);
      if (profilesError) throw profilesError;

      return (profiles || []) as StudentProfile[];
    },
  });
}

export function useAllMastery() {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-mastery'],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concept_mastery')
        .select('*');
      if (error) throw error;
      return data as Tables<'concept_mastery'>[];
    },
  });
}

export function useAllInsights() {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-insights'],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gap_insights')
        .select('*')
        .order('detected_at', { ascending: false });
      if (error) throw error;
      return data as Tables<'gap_insights'>[];
    },
  });
}

export function useAllEvidence() {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-evidence'],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_evidence')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Tables<'learning_evidence'>[];
    },
  });
}
