import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConceptHeatmap } from "@/components/dashboard/ConceptHeatmap";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { IntegrityBadge } from "@/components/integrity/IntegrityBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/hooks/useConcepts";
import { useAllStudents, useAllMastery, useAllInsights, useAllEvidence } from "@/hooks/useTeacherData";
import { useAllIntegrityScores } from "@/hooks/useIntegrity";
import { Users, AlertTriangle, TrendingDown, Target, ChevronRight, BookOpen, Award, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const { userName } = useAuth();
  const navigate = useNavigate();
  const { data: concepts = [], isLoading: cLoading } = useConcepts();
  const { data: students = [], isLoading: sLoading } = useAllStudents();
  const { data: allMastery = [], isLoading: mLoading } = useAllMastery();
  const { data: allInsights = [] } = useAllInsights();
  const { data: allEvidence = [] } = useAllEvidence();
  const { data: allIntegrity = [] } = useAllIntegrityScores();

  const isLoading = cLoading || sLoading || mLoading;

  const classAvgMastery = allMastery.length > 0
    ? Math.round(allMastery.reduce((sum, m) => sum + m.mastery_score, 0) / allMastery.length)
    : 0;

  const conceptAverages = concepts.map(concept => {
    const cm = allMastery.filter(m => m.concept_id === concept.id);
    const avg = cm.length > 0 ? Math.round(cm.reduce((s, m) => s + m.mastery_score, 0) / cm.length) : 0;
    return { concept, average: avg, studentCount: cm.length };
  }).sort((a, b) => a.average - b.average);

  const weakConcepts = conceptAverages.filter(c => c.average < 60 && c.studentCount > 0);

  const studentsNeedingAttention = students.map(student => {
    const sm = allMastery.filter(m => m.student_id === student.user_id);
    if (sm.length === 0) return null;
    const avg = Math.round(sm.reduce((s, m) => s + m.mastery_score, 0) / sm.length);
    if (avg >= 55) return null;
    const declining = sm.some(m => m.trend === 'declining');
    return {
      student,
      avgMastery: avg,
      reason: declining ? 'Performance declining' : 'Low overall mastery',
      urgency: avg < 40 ? 'high' : declining ? 'medium' : 'low' as const
    };
  }).filter(Boolean) as Array<{ student: typeof students[0]; avgMastery: number; reason: string; urgency: 'high' | 'medium' | 'low' }>;

  const topStudents = students.map(student => {
    const sm = allMastery.filter(m => m.student_id === student.user_id);
    if (sm.length === 0) return null;
    const avg = Math.round(sm.reduce((s, m) => s + m.mastery_score, 0) / sm.length);
    return { student, avgMastery: avg };
  }).filter(Boolean).sort((a, b) => (b?.avgMastery || 0) - (a?.avgMastery || 0)).slice(0, 5);

  const recentActivity = allEvidence.slice(0, 3).map(ev => {
    const student = students.find(s => s.user_id === ev.student_id);
    const concept = concepts.find(c => c.id === ev.concept_id);
    const isStruggling = ev.thinking_correctness === 'incorrect';
    return {
      type: isStruggling ? 'struggle' : 'completion',
      studentName: student?.full_name || 'Student',
      conceptName: concept?.name || 'Concept',
      time: new Date(ev.created_at).toLocaleDateString(),
    };
  });

  // Integrity alerts: students with low integrity or high confidence + wrong answers
  const integrityAlerts = allIntegrity
    .filter(s => s.score < 60)
    .map(s => {
      const student = students.find(st => st.user_id === s.student_id);
      return { ...s, studentName: student?.full_name || 'Student' };
    });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Class Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            HTML Fundamentals • {students.length} Students
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="evidence-card flex items-center gap-4">
            <MasteryRing score={classAvgMastery} size="md" showLabel={false} />
            <div>
              <div className="text-sm text-muted-foreground">Class Average</div>
              <div className="text-2xl font-bold">Mastery</div>
            </div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
              <div className="text-2xl font-bold">{students.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning" /></div>
              <div className="text-2xl font-bold">{studentsNeedingAttention.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Need Attention</div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><ShieldAlert className="w-5 h-5 text-destructive" /></div>
              <div className="text-2xl font-bold">{integrityAlerts.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Integrity Alerts</div>
          </div>
        </div>

        {/* Integrity Alerts Section */}
        {integrityAlerts.length > 0 && (
          <div className="evidence-card border-destructive/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Academic Integrity Alerts
            </h2>
            <div className="space-y-3">
              {integrityAlerts.map((alert) => (
                <div key={alert.student_id} className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive/50 to-destructive flex items-center justify-center text-destructive-foreground font-semibold text-sm">
                      {alert.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{alert.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.paste_attempts > 0 && `${alert.paste_attempts} paste attempts • `}
                        {alert.suspicious_entries > 0 && `${alert.suspicious_entries} suspicious entries • `}
                        {alert.tab_switches > 0 && `${alert.tab_switches} tab switches`}
                      </div>
                    </div>
                  </div>
                  <IntegrityBadge score={alert.score} size="md" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Students listed may require guidance or supervision.</p>
          </div>
        )}

        {/* Heatmap */}
        {students.length > 0 && allMastery.length > 0 && (
          <div className="evidence-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Class Concept Heatmap</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/analytics')}>View Details<ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <ConceptHeatmap
              concepts={concepts.map(c => ({ id: c.id, name: c.name, subjectId: c.subject_id, description: c.description, prerequisiteIds: c.prerequisite_ids || [], order: c.sort_order, estimatedMinutes: c.estimated_minutes }))}
              students={students.map(s => ({ id: s.user_id, name: s.full_name, email: '', role: 'student' as const, createdAt: new Date(s.created_at) }))}
              masteryData={allMastery.map(m => ({ studentId: m.student_id, conceptId: m.concept_id, masteryScore: m.mastery_score, masteryLevel: m.mastery_level as any, lastUpdated: new Date(m.last_updated), evidenceCount: m.evidence_count, trend: m.trend as any }))}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="evidence-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />Students Needing Attention</h2>
            {studentsNeedingAttention.length > 0 ? (
              <div className="space-y-3">
                {studentsNeedingAttention.map(({ student, avgMastery, reason, urgency }) => (
                  <div key={student.user_id} className={cn("flex items-center justify-between p-4 rounded-lg border", urgency === 'high' && "bg-destructive/5 border-destructive/20", urgency === 'medium' && "bg-warning/5 border-warning/20", urgency === 'low' && "bg-muted border-border")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {student.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div><div className="font-medium">{student.full_name}</div><div className="text-sm text-muted-foreground">{reason}</div></div>
                    </div>
                    <div className="text-right"><div className="text-lg font-bold">{avgMastery}%</div><div className={cn("text-xs font-medium", urgency === 'high' && "text-destructive", urgency === 'medium' && "text-warning")}>{urgency} priority</div></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">{students.length === 0 ? 'No students enrolled yet.' : 'All students are on track! 🎉'}</p>
            )}
          </div>

          <div className="evidence-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-destructive" />Concepts to Re-teach</h2>
            {weakConcepts.length > 0 ? (
              <div className="space-y-3">
                {weakConcepts.map(({ concept, average, studentCount }) => (
                  <div key={concept.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div><div className="font-medium">{concept.name}</div><div className="text-sm text-muted-foreground">{studentCount} students attempted</div></div>
                    <MasteryRing score={average} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">{allMastery.length === 0 ? 'No student data yet.' : 'All concepts are well understood! 🎉'}</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="evidence-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-success" />Top Performers</h2>
            {topStudents.length > 0 ? (
              <div className="space-y-3">
                {topStudents.map((item, index) => item && (
                  <div key={item.student.user_id} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", index === 0 && "bg-yellow-400 text-yellow-900", index === 1 && "bg-gray-300 text-gray-700", index === 2 && "bg-amber-600 text-amber-100", index > 2 && "bg-muted text-muted-foreground")}>{index + 1}</div>
                      <div className="font-medium">{item.student.full_name}</div>
                    </div>
                    <div className="flex items-center gap-2"><span className="text-lg font-bold text-success">{item.avgMastery}%</span><Award className="w-4 h-4 text-success" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No student data yet.</p>
            )}
          </div>

          <div className="evidence-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-info" />Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mt-0.5", activity.type === 'completion' && "bg-primary/10", activity.type === 'struggle' && "bg-warning/10")}>
                      {activity.type === 'completion' ? <BookOpen className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm"><span className="font-medium">{activity.studentName}</span>{activity.type === 'completion' ? ' completed ' : ' is struggling with '}<span className="font-medium">{activity.conceptName}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No activity yet.</p>
            )}
          </div>
        </div>

        {allInsights.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Learning Insights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {allInsights.slice(0, 4).map((insight) => {
                const student = students.find(s => s.user_id === insight.student_id);
                const concept = concepts.find(c => c.id === insight.concept_id);
                return (
                  <InsightCard
                    key={insight.id}
                    insight={{ ...insight, description: `${student?.full_name || 'Student'}: ${insight.description}` }}
                    conceptName={concept?.name}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
