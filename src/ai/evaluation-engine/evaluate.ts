import { getLLMProvider } from '@/ai/llm/provider';
import { evaluationSystemPrompt, reflectionAnalysisSystemPrompt } from '@/ai/safety';
import type { EvaluationResult, ReflectionAnalysisResult } from './types';

export async function evaluateAnswer(params: {
  conceptName: string;
  studentAnswer: string;
  expectedInsights?: string[];
}): Promise<EvaluationResult> {
  const llm = getLLMProvider();
  const system = evaluationSystemPrompt(params.conceptName, params.expectedInsights);
  const result = await llm.completeJSON<EvaluationResult>(
    [{ role: 'user', content: `Student's answer:\n\n${params.studentAnswer}` }],
    { systemPrompt: system, temperature: 0.2 }
  );
  return normalizeEvaluationResult(result);
}

function normalizeEvaluationResult(r: unknown): EvaluationResult {
  const o = r as Record<string, unknown>;
  return {
    clarity_score: clamp(Number(o?.clarity_score), 0, 100),
    conceptual_accuracy: clamp(Number(o?.conceptual_accuracy), 0, 100),
    depth: ['low', 'medium', 'high'].includes(String(o?.depth)) ? (o.depth as EvaluationResult['depth']) : 'medium',
    misconception_detected: Boolean(o?.misconception_detected),
    feedback: String(o?.feedback ?? ''),
  };
}

export async function analyzeReflection(reflectionText: string): Promise<ReflectionAnalysisResult> {
  const llm = getLLMProvider();
  const result = await llm.completeJSON<ReflectionAnalysisResult>(
    [{ role: 'user', content: `Student reflection:\n\n${reflectionText}` }],
    { systemPrompt: reflectionAnalysisSystemPrompt(), temperature: 0.2 }
  );
  return normalizeReflectionResult(result);
}

function normalizeReflectionResult(r: unknown): ReflectionAnalysisResult {
  const o = r as Record<string, unknown>;
  return {
    emotional_tone: ['positive', 'neutral', 'confused', 'frustrated', 'engaged'].includes(String(o?.emotional_tone))
      ? (o.emotional_tone as ReflectionAnalysisResult['emotional_tone'])
      : 'neutral',
    confusion_indicators: Boolean(o?.confusion_indicators),
    surface_vs_deep: ['surface', 'mixed', 'deep'].includes(String(o?.surface_vs_deep))
      ? (o.surface_vs_deep as ReflectionAnalysisResult['surface_vs_deep'])
      : 'mixed',
    engagement_flag: ['low', 'normal', 'high'].includes(String(o?.engagement_flag))
      ? (o.engagement_flag as ReflectionAnalysisResult['engagement_flag'])
      : 'normal',
    overconfidence_risk: Boolean(o?.overconfidence_risk),
    shallow_reflection_risk: Boolean(o?.shallow_reflection_risk),
    summary: String(o?.summary ?? ''),
  };
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
