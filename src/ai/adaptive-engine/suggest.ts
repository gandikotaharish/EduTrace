import { getLLMProvider } from '@/ai/llm/provider';
import { adaptiveSuggestionSystemPrompt } from '@/ai/safety';

export interface AdaptiveSuggestion {
  suggest_revision_concepts: string[];
  suggest_extra_tasks: string[];
  difficulty_adjustment: 'reduce' | 'maintain' | 'increase';
  reason: string;
}

export async function getAdaptiveSuggestions(params: {
  masteryScore: number;
  integrityScore: number;
  weakConceptNames: string[];
  recentConceptIds: string[];
  conceptListSummary: string;
}): Promise<AdaptiveSuggestion> {
  const llm = getLLMProvider();
  const context = `
Mastery score (0-100): ${params.masteryScore}
Integrity score (0-100): ${params.integrityScore}
Weak concepts: ${params.weakConceptNames.join(', ') || 'None identified'}
Recent concepts: ${params.recentConceptIds.join(', ') || 'None'}
Available concepts (for revision): ${params.conceptListSummary}
`.trim();

  const result = await llm.completeJSON<AdaptiveSuggestion>(
    [{ role: 'user', content: context }],
    { systemPrompt: adaptiveSuggestionSystemPrompt(), temperature: 0.3 }
  );
  return normalizeSuggestions(result);
}

function normalizeSuggestions(r: unknown): AdaptiveSuggestion {
  const o = r as Record<string, unknown>;
  return {
    suggest_revision_concepts: Array.isArray(o?.suggest_revision_concepts)
      ? (o.suggest_revision_concepts as string[]).filter(Boolean)
      : [],
    suggest_extra_tasks: Array.isArray(o?.suggest_extra_tasks)
      ? (o.suggest_extra_tasks as string[]).filter(Boolean)
      : [],
    difficulty_adjustment: ['reduce', 'maintain', 'increase'].includes(String(o?.difficulty_adjustment))
      ? (o.difficulty_adjustment as AdaptiveSuggestion['difficulty_adjustment'])
      : 'maintain',
    reason: String(o?.reason ?? ''),
  };
}
