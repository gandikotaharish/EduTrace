// Mastery utility functions — no dependency on sample data

export function getMasteryLevel(score: number): { level: string; color: string } {
  if (score >= 90) return { level: 'Expert', color: 'mastery-expert' };
  if (score >= 75) return { level: 'Proficient', color: 'mastery-proficient' };
  if (score >= 55) return { level: 'Developing', color: 'mastery-developing' };
  if (score >= 35) return { level: 'Emerging', color: 'mastery-emerging' };
  return { level: 'Novice', color: 'mastery-novice' };
}

export function getMasteryColorClass(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-teal-500';
  if (score >= 55) return 'bg-amber-500';
  if (score >= 35) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getMasteryStrokeColor(score: number): string {
  if (score >= 90) return 'stroke-emerald-500';
  if (score >= 75) return 'stroke-teal-500';
  if (score >= 55) return 'stroke-amber-500';
  if (score >= 35) return 'stroke-orange-500';
  return 'stroke-red-500';
}
