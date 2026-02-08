import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type ConceptMastery = Tables<'concept_mastery'>;
export type GapInsight = Tables<'gap_insights'>;
export type LearningEvidence = Tables<'learning_evidence'>;

export function useStudentMastery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-mastery', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concept_mastery')
        .select('*')
        .eq('student_id', user!.id);
      if (error) throw error;
      return data as ConceptMastery[];
    },
  });
}

export function useStudentInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-insights', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gap_insights')
        .select('*')
        .eq('student_id', user!.id)
        .order('detected_at', { ascending: false });
      if (error) throw error;
      return data as GapInsight[];
    },
  });
}

export function useStudentEvidence(conceptId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-evidence', user?.id, conceptId],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from('learning_evidence')
        .select('*')
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false });
      if (conceptId) {
        query = query.eq('concept_id', conceptId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as LearningEvidence[];
    },
  });
}
