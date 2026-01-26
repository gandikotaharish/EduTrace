// Core Types for EduTrace

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export interface Concept {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  prerequisiteIds: string[];
  order: number;
  estimatedMinutes: number;
}

export interface ConceptContent {
  conceptId: string;
  explanation: string;
  imageUrl?: string;
  thinkingTask: ThinkingTask;
  reflectionPrompts: string[];
  microApplication: MicroApplication;
}

export interface ThinkingTask {
  id: string;
  type: 'predict' | 'explain' | 'fix' | 'compare';
  prompt: string;
  context?: string;
  expectedInsights: string[];
}

export interface MicroApplication {
  id: string;
  prompt: string;
  context?: string;
  rubric: string[];
}

// Evidence Capture
export interface LearningEvidence {
  id: string;
  studentId: string;
  conceptId: string;
  timestamp: Date;
  
  // Thinking Task Evidence
  thinkingAnswer: string;
  thinkingTimeSeconds: number;
  thinkingAttempts: number;
  thinkingCorrectness: 'correct' | 'partial' | 'incorrect';
  
  // Reflection Evidence
  confusionPoint: string;
  mistakeDescription: string;
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  
  // Micro Application Evidence
  applicationAnswer: string;
  applicationTimeSeconds: number;
  applicationCorrectness: 'correct' | 'partial' | 'incorrect';
}

// Mastery & Insights
export type MasteryLevel = 'expert' | 'proficient' | 'developing' | 'emerging' | 'novice';

export interface ConceptMastery {
  studentId: string;
  conceptId: string;
  masteryScore: number; // 0-100
  masteryLevel: MasteryLevel;
  lastUpdated: Date;
  evidenceCount: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface GapInsight {
  id: string;
  studentId: string;
  conceptId: string;
  type: 'fragile_understanding' | 'misconception' | 'missing_prerequisite' | 'false_confidence';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
  detectedAt: Date;
}

// Dashboard Data
export interface StudentProgress {
  student: User;
  overallMastery: number;
  conceptsMastered: number;
  totalConcepts: number;
  strengths: Concept[];
  weaknesses: Concept[];
  recentActivity: LearningEvidence[];
  gapInsights: GapInsight[];
}

export interface ClassInsights {
  classId: string;
  className: string;
  studentCount: number;
  averageMastery: number;
  weakConcepts: Array<{ concept: Concept; averageMastery: number; studentCount: number }>;
  studentsNeedingAttention: Array<{ student: User; reason: string; urgency: 'low' | 'medium' | 'high' }>;
  conceptHeatmap: Array<{ conceptId: string; studentId: string; mastery: number }>;
}

// Learning Flow State
export interface LearningSession {
  conceptId: string;
  step: 'explanation' | 'thinking' | 'reflection' | 'application' | 'complete';
  startTime: Date;
  evidence: Partial<LearningEvidence>;
}
