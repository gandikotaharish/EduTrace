import { getLLMProvider } from '@/ai/llm/provider';

export interface ClassPerformanceSummary {
  summary: string;
  needsReteaching: string[];
  studentRiskPredictions: Array<{ studentName: string; riskScore: number; reason: string }>;
  engagementAnomalies: Array<{ description: string; severity: 'low' | 'medium' | 'high' }>;
  falseConfidenceAlerts: Array<{ conceptName: string; studentCount: number; description: string }>;
}

const SYSTEM = `You are an educational analytics assistant. Based on the provided class data, generate a structured JSON response. Only use the data given. Do not invent student names or concepts. Return valid JSON only.`;

export async function generateClassPerformanceSummary(params: {
  conceptNames: string[];
  studentSummaries: Array<{ name: string; avgMastery: number; conceptScores: Record<string, number> }>;
  gapInsightTypes: string[];
}): Promise<ClassPerformanceSummary> {
  const llm = getLLMProvider();
  const context = `
Concepts: ${params.conceptNames.join(', ')}
Students (name, avg mastery, concept scores): ${JSON.stringify(params.studentSummaries.slice(0, 30))}
Gap insight types in data: ${params.gapInsightTypes.join(', ')}
`.trim();
  const result = await llm.completeJSON<ClassPerformanceSummary>(
    [{ role: 'user', content: `Analyze this class data and return: summary (one paragraph), needsReteaching (array of concept names that need re-teaching), studentRiskPredictions (array of { studentName, riskScore 0-100, reason }), engagementAnomalies (array of { description, severity }), falseConfidenceAlerts (array of { conceptName, studentCount, description }).\n\n${context}` }],
    { systemPrompt: SYSTEM, temperature: 0.3 }
  );
  return normalizeSummary(result);
}

function normalizeSummary(r: unknown): ClassPerformanceSummary {
  const o = r as Record<string, unknown>;
  return {
    summary: String(o?.summary ?? ''),
    needsReteaching: Array.isArray(o?.needsReteaching) ? (o.needsReteaching as string[]) : [],
    studentRiskPredictions: Array.isArray(o?.studentRiskPredictions)
      ? (o.studentRiskPredictions as ClassPerformanceSummary['studentRiskPredictions'])
      : [],
    engagementAnomalies: Array.isArray(o?.engagementAnomalies)
      ? (o.engagementAnomalies as ClassPerformanceSummary['engagementAnomalies'])
      : [],
    falseConfidenceAlerts: Array.isArray(o?.falseConfidenceAlerts)
      ? (o.falseConfidenceAlerts as ClassPerformanceSummary['falseConfidenceAlerts'])
      : [],
  };
}
