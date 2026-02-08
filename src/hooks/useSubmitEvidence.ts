import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EvidenceSubmission {
  conceptId: string;
  thinkingAnswer: string;
  thinkingTimeSeconds: number;
  thinkingAttempts: number;
  thinkingCorrectness: 'correct' | 'partial' | 'incorrect';
  confusionPoint: string;
  mistakeDescription: string;
  confidenceScore: number;
  applicationAnswer: string;
  applicationTimeSeconds: number;
  applicationCorrectness: 'correct' | 'partial' | 'incorrect';
}

export function useSubmitEvidence() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (evidence: EvidenceSubmission) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('learning_evidence')
        .insert({
          student_id: user.id,
          concept_id: evidence.conceptId,
          thinking_answer: evidence.thinkingAnswer,
          thinking_time_seconds: evidence.thinkingTimeSeconds,
          thinking_attempts: evidence.thinkingAttempts,
          thinking_correctness: evidence.thinkingCorrectness,
          confusion_point: evidence.confusionPoint,
          mistake_description: evidence.mistakeDescription,
          confidence_score: evidence.confidenceScore,
          application_answer: evidence.applicationAnswer,
          application_time_seconds: evidence.applicationTimeSeconds,
          application_correctness: evidence.applicationCorrectness,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate mastery and insights queries so they refetch
      queryClient.invalidateQueries({ queryKey: ['student-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['student-insights'] });
      queryClient.invalidateQueries({ queryKey: ['student-evidence'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-insights'] });
      toast({
        title: 'Learning evidence captured!',
        description: 'Your mastery score has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save progress',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
