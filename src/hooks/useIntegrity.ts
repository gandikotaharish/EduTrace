import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLogViolation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logViolation = useCallback(async (
    violationType: string,
    conceptId?: string,
    details?: string
  ) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('integrity_violations')
      .insert({
        student_id: user.id,
        concept_id: conceptId || null,
        violation_type: violationType,
        details: details || '',
      });

    if (error) {
      console.error('Failed to log violation:', error);
    } else {
      queryClient.invalidateQueries({ queryKey: ['integrity-score'] });
    }
  }, [user?.id, queryClient]);

  return logViolation;
}

export function useIntegrityScore(studentId?: string) {
  const { user } = useAuth();
  const id = studentId || user?.id;

  return useQuery({
    queryKey: ['integrity-score', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrity_scores')
        .select('*')
        .eq('student_id', id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAllIntegrityScores() {
  return useQuery({
    queryKey: ['all-integrity-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrity_scores')
        .select('*')
        .order('score', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useStudentViolations(studentId?: string) {
  const { user } = useAuth();
  const id = studentId || user?.id;

  return useQuery({
    queryKey: ['integrity-violations', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrity_violations')
        .select('*')
        .eq('student_id', id!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}
