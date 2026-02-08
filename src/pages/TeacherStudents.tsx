import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/hooks/useConcepts";
import { useAllStudents, useAllMastery, useAllInsights } from "@/hooks/useTeacherData";
import { getMasteryLevel, getMasteryColorClass } from "@/lib/mastery";
import { Search, Users, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Mail, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "mastery" | "attention">("mastery");

  const { data: concepts = [] } = useConcepts();
  const { data: students = [], isLoading: sLoading } = useAllStudents();
  const { data: allMastery = [], isLoading: mLoading } = useAllMastery();
  const { data: allInsights = [] } = useAllInsights();

  const isLoading = sLoading || mLoading;

  const studentDetails = students.map(student => {
    const sm = allMastery.filter(m => m.student_id === student.user_id);
    const avgMastery = sm.length > 0 ? Math.round(sm.reduce((s, m) => s + m.mastery_score, 0) / sm.length) : 0;
    const conceptsMastered = sm.filter(m => m.mastery_score >= 75).length;
    const improving = sm.filter(m => m.trend === 'improving').length;
    const declining = sm.filter(m => m.trend === 'declining').length;
    const trend = improving > declining ? 'improving' : declining > improving ? 'declining' : 'stable';
    const insights = allInsights.filter(g => g.student_id === student.user_id);
    const conceptBreakdown = concepts.map(concept => {
      const mastery = sm.find(m => m.concept_id === concept.id);
      return mastery ? { concept, score: mastery.mastery_score, trend: mastery.trend } : null;
    }).filter(Boolean) as Array<{ concept: typeof concepts[0]; score: number; trend: string }>;

    return { student, avgMastery, conceptsAttempted: sm.length, conceptsMastered, trend, insights, conceptBreakdown };
  });

  const filtered = studentDetails
    .filter(s => s.student.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.student.full_name.localeCompare(b.student.full_name);
      if (sortBy === 'mastery') return b.avgMastery - a.avgMastery;
      return a.avgMastery - b.avgMastery;
    });

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return <DashboardLayout><div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid sm:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Students</h1><p className="text-muted-foreground mt-1">Monitor individual student progress and learning gaps</p></div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div><div><div className="text-2xl font-bold">{students.length}</div><div className="text-sm text-muted-foreground">Total Students</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-emerald-500" /></div><div><div className="text-2xl font-bold">{studentDetails.filter(s => s.avgMastery >= 75).length}</div><div className="text-sm text-muted-foreground">On Track</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><div className="text-2xl font-bold">{studentDetails.filter(s => s.avgMastery < 55 && s.avgMastery > 0).length}</div><div className="text-sm text-muted-foreground">Need Attention</div></div></div></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <div className="flex gap-2">
            {([{ key: 'mastery', label: 'Mastery' }, { key: 'attention', label: 'Needs Help' }, { key: 'name', label: 'Name' }] as const).map(sort => (
              <Button key={sort.key} variant={sortBy === sort.key ? 'default' : 'outline'} size="sm" onClick={() => setSortBy(sort.key)}>{sort.label}</Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{students.length === 0 ? 'No students enrolled yet' : 'No students match your search'}</p>
            <p className="text-sm">{students.length === 0 ? 'Students will appear here once they sign up.' : 'Try a different search term.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ student, avgMastery, conceptsAttempted, conceptsMastered, trend, insights, conceptBreakdown }) => {
              const isExpanded = expandedStudent === student.user_id;
              const { level } = getMasteryLevel(avgMastery);
              return (
                <div key={student.user_id} className="evidence-card !p-0 overflow-hidden">
                  <button onClick={() => setExpandedStudent(isExpanded ? null : student.user_id)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">{student.full_name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="font-semibold truncate">{student.full_name}</span><TrendIcon trend={trend} />{insights.length > 0 && <Badge variant="destructive" className="text-xs px-1.5 py-0">{insights.length} gap{insights.length > 1 ? 's' : ''}</Badge>}</div>
                      <div className="text-sm text-muted-foreground">{conceptsMastered}/{concepts.length} concepts mastered • {level}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4"><div className="w-32"><Progress value={avgMastery} className="h-2" /></div><span className="text-lg font-bold w-12 text-right">{avgMastery}%</span></div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border p-5 bg-muted/10 space-y-5">
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <MasteryRing score={avgMastery} size="md" />
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-lg bg-card border border-border"><div className="text-xl font-bold">{conceptsAttempted}</div><div className="text-xs text-muted-foreground">Attempted</div></div>
                            <div className="text-center p-3 rounded-lg bg-card border border-border"><div className="text-xl font-bold text-emerald-500">{conceptsMastered}</div><div className="text-xs text-muted-foreground">Mastered</div></div>
                            <div className="text-center p-3 rounded-lg bg-card border border-border"><div className="text-xl font-bold">{concepts.length - conceptsAttempted}</div><div className="text-xs text-muted-foreground">Not Started</div></div>
                          </div>
                        </div>
                      </div>
                      {conceptBreakdown.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Concept Breakdown</h4>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {conceptBreakdown.map(({ concept, score, trend: cTrend }) => (
                              <div key={concept.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                <div className="flex items-center gap-2 min-w-0"><div className={cn("w-3 h-3 rounded-full shrink-0", getMasteryColorClass(score))} /><span className="text-sm font-medium truncate">{concept.name}</span></div>
                                <div className="flex items-center gap-2 shrink-0"><TrendIcon trend={cTrend} /><span className="text-sm font-bold">{score}%</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {insights.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Learning Gaps Detected</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {insights.map(insight => {
                              const concept = concepts.find(c => c.id === insight.concept_id);
                              return <InsightCard key={insight.id} insight={insight} conceptName={concept?.name} />;
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
        )}
      </div>
    </DashboardLayout>
  );
}
