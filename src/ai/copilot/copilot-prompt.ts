import { getLLMProvider } from '@/ai/llm/provider';
import { systemPromptWithContext } from '@/ai/safety';

export interface CopilotContext {
  userName?: string;
  masteryScore?: number;
  integrityScore?: number;
  weakConcepts?: string[];
  currentConcept?: string;
  recentReflection?: string;
}

const COPILOT_SYSTEM = `You are a personal learning copilot for a student. You know their mastery level, integrity score, and weak concepts. Your role is to:
- Explain concepts differently if they seem confused
- Give simpler examples when needed
- Ask counter-questions to deepen understanding
- Encourage reflection
Stay within the syllabus. Be supportive and concise. Do not make up facts.`;

export async function getCopilotResponse(
  userMessage: string,
  context: CopilotContext,
  responseLanguage: string = 'en'
): Promise<string> {
  const llm = getLLMProvider();
  const ctxBlock = [
    context.userName && `Student: ${context.userName}`,
    context.masteryScore != null && `Overall mastery: ${context.masteryScore}%`,
    context.integrityScore != null && `Integrity score: ${context.integrityScore}%`,
    context.weakConcepts?.length && `Weak areas: ${context.weakConcepts.join(', ')}`,
    context.currentConcept && `Current concept: ${context.currentConcept}`,
    context.recentReflection && `Recent reflection: ${context.recentReflection.slice(0, 300)}`,
  ]
    .filter(Boolean)
    .join('\n');

  const system = `${COPILOT_SYSTEM}\n\nContext:\n${ctxBlock}`;
  const langInstruction = responseLanguage !== 'en' ? ` Respond in the user's language (code: ${responseLanguage}).` : '';
  const out = await llm.complete(
    [{ role: 'user', content: userMessage + langInstruction }],
    { systemPrompt: system + langInstruction, temperature: 0.4, maxTokens: 512 }
  );
  return (out || 'I could not generate a response. Please try again.').trim();
}
