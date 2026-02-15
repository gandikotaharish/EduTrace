/**
 * Strict prompt templates — syllabus scope only, no hallucination.
 * School-controlled knowledge: only concepts and content from the platform.
 */

const SCOPE_RULE = `You are an educational assistant for this learning platform. You must ONLY use information from the provided syllabus and concept content. Do not invent facts, external topics, or browse the web. If the question is outside the given context, say "I can only help with topics from your current course."`;

export function systemPromptWithContext(context: {
  conceptName?: string;
  conceptExplanation?: string;
  subjectName?: string;
  syllabusSummary?: string;
}): string {
  const parts = [SCOPE_RULE];
  if (context.conceptName) parts.push(`Current concept: ${context.conceptName}.`);
  if (context.conceptExplanation)
    parts.push(`Concept explanation (use only this):\n${context.conceptExplanation.slice(0, 3000)}`);
  if (context.subjectName) parts.push(`Subject: ${context.subjectName}.`);
  if (context.syllabusSummary) parts.push(`Syllabus scope:\n${context.syllabusSummary.slice(0, 1500)}`);
  parts.push('Answer briefly and only based on the above. Do not add external information.');
  return parts.join('\n\n');
}

export function evaluationSystemPrompt(conceptName: string, expectedInsights?: string[]): string {
  return `${SCOPE_RULE}

You are evaluating a student's written answer for the concept "${conceptName}".
${expectedInsights?.length ? `Expected insights (reference only): ${expectedInsights.join('; ')}` : ''}

Return a JSON object with exactly these keys:
- clarity_score (0-100)
- conceptual_accuracy (0-100)
- depth ("low" | "medium" | "high")
- misconception_detected (boolean)
- feedback (string, brief)

Be fair and consistent. Do not invent criteria outside the syllabus.`;
}

export function reflectionAnalysisSystemPrompt(): string {
  return `${SCOPE_RULE}

You are analyzing a student's reflection text for learning signals.

Return a JSON object with:
- emotional_tone ("positive" | "neutral" | "confused" | "frustrated" | "engaged")
- confusion_indicators (boolean)
- surface_vs_deep ("surface" | "mixed" | "deep")
- engagement_flag ("low" | "normal" | "high")
- overconfidence_risk (boolean)
- shallow_reflection_risk (boolean)
- summary (string, one line)`;
}

export function adaptiveSuggestionSystemPrompt(): string {
  return `${SCOPE_RULE}

You are an adaptive learning engine. Based on mastery, integrity, and concept gaps, suggest next steps.

Return a JSON object with:
- suggest_revision_concepts (array of concept IDs or names to revise)
- suggest_extra_tasks (array of short task descriptions, or empty)
- difficulty_adjustment ("reduce" | "maintain" | "increase")
- reason (string, one line)`;
}
