/**
 * Integrity monitor — extends platform integrity with AI flags.
 * Platform already has: paste attempts, tab switches, shallow reflections, etc.
 * AI can flag: overconfidence_risk, shallow_reflection_risk from reflection analysis.
 */
export { analyzeReflection } from '@/ai/evaluation-engine';
export type { ReflectionAnalysisResult } from '@/ai/evaluation-engine';
