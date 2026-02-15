import { useQuery } from '@tanstack/react-query';
import { useConcepts } from './useConcepts';
import { useAllStudents, useAllMastery, useAllInsights } from './useTeacherData';
import { generateClassPerformanceSummary } from '@/ai/teacher-intelligence';

export function useTeacherAIInsights() {
  const { data: concepts = [] } = useConcepts();
  const { data: students = [] } = useAllStudents();
  const { data: allMastery = [] } = useAllMastery();
  const { data: allInsights = [] } = useAllInsights();

  return useQuery({
    queryKey: ['teacher-ai-insights', concepts.length, students.length, allMastery.length],
    enabled: concepts.length > 0 && students.length > 0,
    queryFn: async () => {
      const conceptNames = concepts.map((c) => c.name);
      const studentSummaries = students.map((s) => {
        const mastery = allMastery.filter((m) => m.student_id === s.user_id);
        const conceptScores: Record<string, number> = {};
        mastery.forEach((m) => {
          const name = concepts.find((c) => c.id === m.concept_id)?.name;
          if (name) conceptScores[name] = m.mastery_score;
        });
        const avgMastery = mastery.length ? Math.round(mastery.reduce((a, m) => a + m.mastery_score, 0) / mastery.length) : 0;
        return { name: s.full_name, avgMastery, conceptScores };
      });
      const gapInsightTypes = [...new Set(allInsights.map((g) => g.type))];
      return generateClassPerformanceSummary({
        conceptNames,
        studentSummaries,
        gapInsightTypes,
      });
    },
  });
}
