import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ============ Schools ============

export function useSchools() {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['admin-schools'],
    enabled: userRole === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSchool() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (school: { name: string; location?: string; academic_level: string }) => {
      const { data, error } = await supabase.from('schools').insert(school).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School created successfully' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateSchool() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; location?: string; academic_level?: string; is_active?: boolean }) => {
      const { error } = await supabase.from('schools').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School updated' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ============ Classes ============

export function useClasses(schoolId?: string) {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['admin-classes', schoolId],
    enabled: userRole === 'admin',
    queryFn: async () => {
      let q = supabase.from('classes').select('*, schools(name)').order('name');
      if (schoolId) q = q.eq('school_id', schoolId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (cls: { school_id: string; name: string; grade_level?: string; section?: string }) => {
      const { data, error } = await supabase.from('classes').insert(cls).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-classes'] });
      toast({ title: 'Class created successfully' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; grade_level?: string; section?: string; is_active?: boolean }) => {
      const { error } = await supabase.from('classes').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-classes'] });
      toast({ title: 'Class updated' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ============ Admin User Management ============

export function useAdminUsers() {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['admin-all-users'],
    enabled: userRole === 'admin',
    queryFn: async () => {
      // Get profiles, roles, and auth user data
      const [profilesRes, rolesRes, authRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('*'),
        supabase.functions.invoke('admin-manage-users', { body: { action: 'list_users' } }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const authUsers = authRes.data?.users || [];

      return (profilesRes.data || []).map((p) => {
        const role = rolesRes.data?.find((r) => r.user_id === p.user_id);
        const authUser = authUsers.find((u: any) => u.id === p.user_id);
        return {
          ...p,
          role: role?.role || 'student',
          email: authUser?.email || '',
          last_sign_in_at: authUser?.last_sign_in_at || null,
          banned: authUser?.banned_until ? new Date(authUser.banned_until) > new Date() : false,
        };
      });
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { email: string; password: string; full_name: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'create_user', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast({ title: 'User created successfully' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useResetPassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { user_id: string; new_password: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'reset_password', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => toast({ title: 'Password reset successfully' }),
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { user_id: string; is_active: boolean }) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'toggle_active', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast({ title: vars.is_active ? 'Account activated' : 'Account deactivated' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ============ Assignments ============

export function useTeacherAssignments() {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['admin-teacher-assignments'],
    enabled: userRole === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select('*, schools(name), classes(name), subjects(name)');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTeacherAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { teacher_id: string; school_id: string; class_id?: string; subject_id?: string }) => {
      const { error } = await supabase.from('teacher_assignments').insert(params);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-teacher-assignments'] });
      toast({ title: 'Teacher assigned' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteTeacherAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('teacher_assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-teacher-assignments'] });
      toast({ title: 'Assignment removed' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useStudentAssignments() {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['admin-student-assignments'],
    enabled: userRole === 'admin',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_assignments')
        .select('*, schools(name), classes(name)');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStudentAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { student_id: string; school_id: string; class_id: string }) => {
      const { error } = await supabase.from('student_assignments').insert(params);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-student-assignments'] });
      toast({ title: 'Student assigned' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteStudentAssignment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('student_assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-student-assignments'] });
      toast({ title: 'Assignment removed' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ============ Platform Stats ============

export function usePlatformStats() {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['admin-platform-stats'],
    enabled: userRole === 'admin',
    queryFn: async () => {
      const [schoolsRes, classesRes, rolesRes, masteryRes, evidenceRes] = await Promise.all([
        supabase.from('schools').select('id, is_active'),
        supabase.from('classes').select('id'),
        supabase.from('user_roles').select('role'),
        supabase.from('concept_mastery').select('mastery_score, concept_id'),
        supabase.from('learning_evidence').select('id'),
      ]);

      const roles = rolesRes.data || [];
      const mastery = masteryRes.data || [];

      return {
        totalSchools: schoolsRes.data?.length || 0,
        activeSchools: schoolsRes.data?.filter((s) => s.is_active).length || 0,
        totalClasses: classesRes.data?.length || 0,
        totalStudents: roles.filter((r) => r.role === 'student').length,
        totalTeachers: roles.filter((r) => r.role === 'teacher').length,
        totalAdmins: roles.filter((r) => r.role === 'admin').length,
        averageMastery: mastery.length > 0
          ? Math.round(mastery.reduce((sum, m) => sum + m.mastery_score, 0) / mastery.length)
          : 0,
        totalEvidence: evidenceRes.data?.length || 0,
      };
    },
  });
}
