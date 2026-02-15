/**
 * Mastery certification engine — when mastery > threshold,
 * generate AI-based skill certificate with reasoning summary.
 */
export interface MasteryCertificate {
  studentName: string;
  conceptName: string;
  masteryScore: number;
  summary: string;
  issuedAt: string;
}
