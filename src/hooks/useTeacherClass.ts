import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/** Students enrolled in a specific class (for class teacher overview). */
export function useStudentsInClass(classId: string | null) {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['students-in-class', classId],
    enabled: (userRole === 'teacher' || userRole === 'admin') && !!classId,
    queryFn: async () => {
      const { data: sa, error: saError } = await supabase
        .from('student_assignments')
        .select('student_id')
        .eq('class_id', classId!);
      if (saError) throw saError;
      const ids = [...new Set((sa || []).map((a) => a.student_id))];
      if (ids.length === 0) return [];
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', ids);
      if (pError) throw pError;
      return (profiles || []) as Array<{ user_id: string; full_name: string; avatar_url: string | null }>;
    },
  });
}

/** Classes where the current user is the class teacher */
export function useMyClassTeacherClasses() {
  const { user, userRole } = useAuth();
  return useQuery({
    queryKey: ['my-class-teacher-classes', user?.id],
    enabled: (userRole === 'teacher' || userRole === 'admin') && !!user?.id,
    queryFn: async () => {
      const { data: cta, error: ctaError } = await supabase
        .from('class_teacher_assignments')
        .select('class_id')
        .eq('teacher_id', user!.id);
      if (ctaError) throw ctaError;
      const classIds = (cta || []).map((r) => r.class_id);
      if (classIds.length === 0) return [];
      const { data: classes, error } = await supabase
        .from('classes')
        .select('*, schools(name)')
        .in('id', classIds)
        .order('name');
      if (error) throw error;
      return classes || [];
    },
  });
}

/** Bulk create students (class teacher only). Returns created with email/password for credential sheet. */
export function useTeacherCreateStudents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: {
      class_id: string;
      school_id: string;
      students: Array<{ email: string; full_name?: string; password?: string }>;
    }) => {
      const { data, error } = await supabase.functions.invoke('teacher-create-students', {
        body: {
          action: 'create_students',
          class_id: params.class_id,
          school_id: params.school_id,
          students: params.students,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { created: Array<{ email: string; password: string; full_name: string }>; errors: Array<{ row: number; message: string }> };
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['teacher-students'] });
      qc.invalidateQueries({ queryKey: ['admin-student-assignments'] });
      qc.invalidateQueries({ queryKey: ['students-in-class', variables.class_id] });
      toast({
        title: 'Students created',
        description: `${data.created.length} created${data.errors.length ? `, ${data.errors.length} failed` : ''}. Download the credential sheet before closing.`,
      });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useInterventionLog(studentId?: string) {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['intervention-log', studentId],
    enabled: (userRole === 'teacher' || userRole === 'admin') && !!studentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intervention_log')
        .select('*')
        .eq('student_id', studentId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddIntervention() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { student_id: string; class_id: string; teacher_id: string; type: string; notes?: string }) => {
      const { data, error } = await supabase.from('intervention_log').insert(params).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['intervention-log', vars.student_id] });
      toast({ title: 'Intervention logged' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useAttendance(classId: string | null, date?: string) {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['attendance', classId, date],
    enabled: (userRole === 'teacher' || userRole === 'admin') && !!classId,
    queryFn: async () => {
      let q = supabase.from('attendance').select('*').eq('class_id', classId!);
      if (date) q = q.eq('date', date);
      const { data, error } = await q.order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordAttendance() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { student_id: string; class_id: string; date: string; status: string; recorded_by: string }) => {
      const { error } = await supabase.from('attendance').upsert(params, { onConflict: 'student_id,class_id,date' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Attendance recorded' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function usePerformanceFlags(studentId?: string) {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: ['performance-flags', studentId],
    enabled: (userRole === 'teacher' || userRole === 'admin') && !!studentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_flags')
        .select('*')
        .eq('student_id', studentId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddPerformanceFlag() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: { student_id: string; type: string; description?: string; severity?: string }) => {
      const { data, error } = await supabase
        .from('performance_flags')
        .insert({ ...params, teacher_id: user!.id, severity: params.severity || 'medium' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['performance-flags', vars.student_id] });
      toast({ title: 'Flag added' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}
