import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Subject = Tables<'subjects'>;
export type Concept = Tables<'concepts'>;
export type ConceptContent = Tables<'concept_content'>;

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Subject[];
    },
  });
}

export function useConcepts(subjectId?: string) {
  return useQuery({
    queryKey: ['concepts', subjectId],
    queryFn: async () => {
      let query = supabase
        .from('concepts')
        .select('*')
        .order('sort_order');
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Concept[];
    },
  });
}

export function useConceptWithContent(conceptId: string | undefined) {
  return useQuery({
    queryKey: ['concept-with-content', conceptId],
    enabled: !!conceptId,
    queryFn: async () => {
      const [conceptResult, contentResult] = await Promise.all([
        supabase.from('concepts').select('*').eq('id', conceptId!).maybeSingle(),
        supabase.from('concept_content').select('*').eq('concept_id', conceptId!).maybeSingle(),
      ]);
      if (conceptResult.error) throw conceptResult.error;
      if (contentResult.error) throw contentResult.error;
      return {
        concept: conceptResult.data as Concept | null,
        content: contentResult.data as ConceptContent | null,
      };
    },
  });
}

export function useAllConceptContent() {
  return useQuery({
    queryKey: ['all-concept-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concept_content')
        .select('*');
      if (error) throw error;
      return data as ConceptContent[];
    },
  });
}
