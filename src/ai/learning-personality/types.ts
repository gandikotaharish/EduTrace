/**
 * Learning personality detection — AI classifies student learning style.
 * Used to adapt explanations (analytical, visual, reflective, fast responder, careless).
 */
export type LearningStyle =
  | 'analytical'
  | 'visual'
  | 'reflective'
  | 'fast_responder'
  | 'careless_responder'
  | 'mixed';

export interface LearningPersonalityResult {
  primary: LearningStyle;
  secondary?: LearningStyle;
  confidence: number;
  suggestedAdaptations: string[];
}
