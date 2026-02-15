/**
 * Predictive analytics types and helpers.
 * Exam risk, dropout signals, mastery forecasting, effort vs performance.
 */

export interface ExamRiskPrediction {
  studentId: string;
  riskScore: number;
  factors: string[];
  suggestedActions: string[];
}

export interface DropoutRiskSignal {
  studentId: string;
  score: number;
  signals: string[];
}

export interface MasteryForecast {
  conceptId: string;
  studentId: string;
  currentScore: number;
  projectedScore: number;
  confidence: number;
}

export interface EffortPerformanceImbalance {
  studentId: string;
  effortIndicator: number;
  performanceScore: number;
  imbalance: 'high_effort_low_performance' | 'low_effort_high_performance' | 'balanced';
}
