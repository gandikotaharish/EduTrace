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

/** Teacher's assigned schools, classes, subjects (for scoping). */
export function useTeacherMyAssignments() {
  const { user, userRole } = useAuth();
  return useQuery({
    queryKey: ['teacher-my-assignments', user?.id],
    enabled: (userRole === 'teacher' || userRole === 'admin') && !!user?.id,
    queryFn: async () => {
      if (userRole === 'admin') return [];
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select('school_id, class_id, subject_id')
        .eq('teacher_id', user!.id);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllStudents() {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-students', userRole, user?.id],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      if (userRole === 'admin') {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'student');
        if (rolesError) throw rolesError;
        if (!roles || roles.length === 0) return [];
        const studentIds = roles.map((r) => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, created_at')
          .in('user_id', studentIds);
        if (profilesError) throw profilesError;
        return (profiles || []) as StudentProfile[];
      }

      const { data: myAssignments, error: assignError } = await supabase
        .from('teacher_assignments')
        .select('class_id')
        .eq('teacher_id', user!.id);
      if (assignError) throw assignError;
      const classIds = [...new Set((myAssignments || []).map((a) => a.class_id).filter(Boolean))] as string[];
      if (classIds.length === 0) return [];

      const { data: studentAssignments, error: saError } = await supabase
        .from('student_assignments')
        .select('student_id')
        .in('class_id', classIds);
      if (saError) throw saError;
      const studentIds = [...new Set((studentAssignments || []).map((a) => a.student_id))];
      if (studentIds.length === 0) return [];

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
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-mastery', userRole, user?.id],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      let studentIds: string[] | null = null;
      if (userRole === 'teacher' && user?.id) {
        const { data: myAssignments } = await supabase
          .from('teacher_assignments')
          .select('class_id')
          .eq('teacher_id', user.id);
        const classIds = [...new Set((myAssignments || []).map((a) => a.class_id).filter(Boolean))] as string[];
        if (classIds.length > 0) {
          const { data: sa } = await supabase
            .from('student_assignments')
            .select('student_id')
            .in('class_id', classIds);
          studentIds = [...new Set((sa || []).map((a) => a.student_id))];
        }
      }
      let q = supabase.from('concept_mastery').select('*');
      if (studentIds && studentIds.length > 0) q = q.in('student_id', studentIds);
      const { data, error } = await q;
      if (error) throw error;
      return data as Tables<'concept_mastery'>[];
    },
  });
}

export function useAllInsights() {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-insights', userRole, user?.id],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      let studentIds: string[] | null = null;
      if (userRole === 'teacher' && user?.id) {
        const { data: myAssignments } = await supabase
          .from('teacher_assignments')
          .select('class_id')
          .eq('teacher_id', user.id);
        const classIds = [...new Set((myAssignments || []).map((a) => a.class_id).filter(Boolean))] as string[];
        if (classIds.length > 0) {
          const { data: sa } = await supabase
            .from('student_assignments')
            .select('student_id')
            .in('class_id', classIds);
          studentIds = [...new Set((sa || []).map((a) => a.student_id))];
        }
      }
      let q = supabase.from('gap_insights').select('*').order('detected_at', { ascending: false });
      if (studentIds && studentIds.length > 0) q = q.in('student_id', studentIds);
      const { data, error } = await q;
      if (error) throw error;
      return data as Tables<'gap_insights'>[];
    },
  });
}

export function useAllEvidence() {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['teacher-evidence', userRole, user?.id],
    enabled: userRole === 'teacher' || userRole === 'admin',
    queryFn: async () => {
      let studentIds: string[] | null = null;
      if (userRole === 'teacher' && user?.id) {
        const { data: myAssignments } = await supabase
          .from('teacher_assignments')
          .select('class_id')
          .eq('teacher_id', user.id);
        const classIds = [...new Set((myAssignments || []).map((a) => a.class_id).filter(Boolean))] as string[];
        if (classIds.length > 0) {
          const { data: sa } = await supabase
            .from('student_assignments')
            .select('student_id')
            .in('class_id', classIds);
          studentIds = [...new Set((sa || []).map((a) => a.student_id))];
        }
      }
      let q = supabase.from('learning_evidence').select('*').order('created_at', { ascending: false }).limit(100);
      if (studentIds && studentIds.length > 0) q = q.in('student_id', studentIds);
      const { data, error } = await q;
      if (error) throw error;
      return data as Tables<'learning_evidence'>[];
    },
  });
}
