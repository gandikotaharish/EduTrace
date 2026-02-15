export interface EvaluationResult {
  clarity_score: number;
  conceptual_accuracy: number;
  depth: 'low' | 'medium' | 'high';
  misconception_detected: boolean;
  feedback: string;
}

export interface ReflectionAnalysisResult {
  emotional_tone: 'positive' | 'neutral' | 'confused' | 'frustrated' | 'engaged';
  confusion_indicators: boolean;
  surface_vs_deep: 'surface' | 'mixed' | 'deep';
  engagement_flag: 'low' | 'normal' | 'high';
  overconfidence_risk: boolean;
  shallow_reflection_risk: boolean;
  summary: string;
}
