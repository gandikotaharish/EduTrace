import { getLLMProvider } from '@/ai/llm/provider';
import { getVoiceContext } from './context';
import { systemPromptWithContext } from '@/ai/safety';

/**
 * Context-aware voice assistant: answers only within syllabus and current concept.
 */
export async function askVoiceAssistant(userQuestion: string, responseLanguage: string = 'en'): Promise<string> {
  const ctx = getVoiceContext();
  const system = systemPromptWithContext({
    conceptName: ctx.conceptName,
    conceptExplanation: ctx.conceptExplanation,
    subjectName: ctx.subjectName,
    syllabusSummary: ctx.conceptExplanation ? `Current concept: ${ctx.conceptName}. Use only the explanation provided.` : undefined,
  });
  const langInstruction = responseLanguage !== 'en' ? ` Respond in the user's language (language code: ${responseLanguage}).` : '';
  const llm = getLLMProvider();
  const out = await llm.complete(
    [{ role: 'user', content: userQuestion + langInstruction }],
    { systemPrompt: system + langInstruction, temperature: 0.4, maxTokens: 512 }
  );
  return (out || 'I could not generate a response. Please try again.').trim();
}
