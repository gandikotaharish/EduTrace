import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts, useAllConceptContent } from "@/hooks/useConcepts";
import { useAllStudents, useAllMastery, useAllInsights } from "@/hooks/useTeacherData";
import { getMasteryColorClass, getMasteryLevel } from "@/lib/mastery";
import { BookOpen, Clock, Users, AlertTriangle, ChevronDown, ChevronUp, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherConcepts() {
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const { data: concepts = [], isLoading: cLoading } = useConcepts();
  const { data: allContent = [] } = useAllConceptContent();
  const { data: students = [] } = useAllStudents();
  const { data: allMastery = [], isLoading: mLoading } = useAllMastery();
  const { data: allInsights = [] } = useAllInsights();

  const isLoading = cLoading || mLoading;

  const conceptStats = concepts.map(concept => {
    const mastery = allMastery.filter(m => m.concept_id === concept.id);
    const avgMastery = mastery.length > 0 ? Math.round(mastery.reduce((s, m) => s + m.mastery_score, 0) / mastery.length) : 0;
    const studentsMastered = mastery.filter(m => m.mastery_score >= 75).length;
    const studentsStruggling = mastery.filter(m => m.mastery_score < 55).length;
    const gapCount = allInsights.filter(g => g.concept_id === concept.id).length;
    const hasContent = allContent.some(c => c.concept_id === concept.id);
    return { concept, avgMastery, studentsAttempted: mastery.length, studentsMastered, studentsStruggling, gapCount, hasContent };
  });

  const overallAvg = conceptStats.filter(c => c.studentsAttempted > 0).length > 0
    ? Math.round(conceptStats.filter(c => c.studentsAttempted > 0).reduce((s, c) => s + c.avgMastery, 0) / conceptStats.filter(c => c.studentsAttempted > 0).length)
    : 0;

  if (isLoading) {
    return <DashboardLayout><div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Concepts</h1><p className="text-muted-foreground mt-1">Manage and monitor curriculum concepts and student comprehension</p></div>

        <div className="grid sm:grid-cols-4 gap-4">
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Layers className="w-5 h-5 text-primary" /></div><div><div className="text-2xl font-bold">{concepts.length}</div><div className="text-sm text-muted-foreground">Total Concepts</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div><div><div className="text-2xl font-bold">{conceptStats.filter(c => c.hasContent).length}</div><div className="text-sm text-muted-foreground">With Content</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning" /></div><div><div className="text-2xl font-bold">{conceptStats.filter(c => c.avgMastery < 55 && c.studentsAttempted > 0).length}</div><div className="text-sm text-muted-foreground">Low Mastery</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><MasteryRing score={overallAvg} size="sm" showLabel={false} /><div><div className="text-2xl font-bold">{overallAvg}%</div><div className="text-sm text-muted-foreground">Avg Mastery</div></div></div></div>
        </div>

        <div className="space-y-3">
          {conceptStats.map(({ concept, avgMastery, studentsAttempted, studentsMastered, studentsStruggling, gapCount, hasContent }) => {
            const isExpanded = expandedConcept === concept.id;
            const { level } = getMasteryLevel(avgMastery);
            const prereqs = concepts.filter(c => (concept.prerequisite_ids || []).includes(c.id));
            const studentBreakdown = students.map(student => {
              const mastery = allMastery.find(m => m.student_id === student.user_id && m.concept_id === concept.id);
              return mastery ? { student, mastery } : null;
            }).filter(Boolean) as Array<{ student: typeof students[0]; mastery: typeof allMastery[0] }>;
            const conceptInsights = allInsights.filter(g => g.concept_id === concept.id);

            return (
              <div key={concept.id} className="evidence-card !p-0 overflow-hidden">
                <button onClick={() => setExpandedConcept(isExpanded ? null : concept.id)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors">
                  <div className={cn("w-3 h-12 rounded-full shrink-0", studentsAttempted > 0 ? getMasteryColorClass(avgMastery) : "bg-muted")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{concept.name}</span>
                      <Badge variant="outline" className="text-xs">#{concept.sort_order}</Badge>
                      {hasContent ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Content Ready</Badge> : <Badge variant="secondary" className="text-xs">No Content</Badge>}
                      {gapCount > 0 && <Badge variant="destructive" className="text-xs">{gapCount} gap{gapCount > 1 ? 's' : ''}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{concept.description}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center"><div className="text-lg font-bold">{studentsAttempted}</div><div className="text-xs text-muted-foreground">Attempted</div></div>
                    <div className="text-center"><div className="text-lg font-bold">{studentsAttempted > 0 ? `${avgMastery}%` : '—'}</div><div className="text-xs text-muted-foreground">Avg Mastery</div></div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="border-t border-border p-5 bg-muted/10 space-y-5">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{concept.estimated_minutes} min</div>
                      <div className="flex items-center gap-1"><Users className="w-4 h-4" />{studentsAttempted}/{students.length} students</div>
                      {prereqs.length > 0 && <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" />Prerequisites: {prereqs.map(p => p.name).join(', ')}</div>}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Mastery Distribution</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {[{ label: 'Expert', min: 90, max: 100, color: 'bg-emerald-500' }, { label: 'Proficient', min: 75, max: 89, color: 'bg-teal-500' }, { label: 'Developing', min: 55, max: 74, color: 'bg-amber-500' }, { label: 'Emerging', min: 35, max: 54, color: 'bg-orange-500' }, { label: 'Novice', min: 0, max: 34, color: 'bg-red-500' }].map(tier => {
                          const count = studentBreakdown.filter(s => s.mastery.mastery_score >= tier.min && s.mastery.mastery_score <= tier.max).length;
                          return <div key={tier.label} className="text-center p-3 rounded-lg bg-card border border-border"><div className={cn("w-4 h-4 rounded-full mx-auto mb-1", tier.color)} /><div className="text-lg font-bold">{count}</div><div className="text-xs text-muted-foreground">{tier.label}</div></div>;
                        })}
                      </div>
                    </div>
                    {studentBreakdown.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Student Performance</h4>
                        <div className="space-y-2">
                          {studentBreakdown.sort((a, b) => a.mastery.mastery_score - b.mastery.mastery_score).map(({ student, mastery }) => (
                            <div key={student.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold text-xs">{student.full_name.split(' ').map(n => n[0]).join('')}</div>
                              <span className="flex-1 text-sm font-medium">{student.full_name}</span>
                              <div className="w-24"><Progress value={mastery.mastery_score} className="h-2" /></div>
                              <span className="text-sm font-bold w-10 text-right">{mastery.mastery_score}%</span>
                              <Badge className={cn("text-xs", getMasteryLevel(mastery.mastery_score).color)}>{getMasteryLevel(mastery.mastery_score).level}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {conceptInsights.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Detected Gaps ({conceptInsights.length})</h4>
                        <div className="space-y-2">
                          {conceptInsights.map(insight => {
                            const student = students.find(s => s.user_id === insight.student_id);
                            return (
                              <div key={insight.id} className={cn("p-3 rounded-lg border text-sm", insight.severity === 'high' ? "bg-destructive/5 border-destructive/20" : insight.severity === 'medium' ? "bg-warning/5 border-warning/20" : "bg-muted/50 border-border")}>
                                <div className="font-medium">{student?.full_name}: {insight.type.replace('_', ' ')}</div>
                                <div className="text-muted-foreground mt-1">{insight.description}</div>
                                <div className="text-xs text-primary mt-1">💡 {insight.suggested_action}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
