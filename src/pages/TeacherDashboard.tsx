import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConceptHeatmap } from "@/components/dashboard/ConceptHeatmap";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { Button } from "@/components/ui/button";
import { 
  currentTeacher, 
  concepts, 
  sampleStudents, 
  sampleMasteryData, 
  sampleGapInsights 
} from "@/data/sampleData";
import { Users, AlertTriangle, TrendingDown, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  // Calculate class-level stats
  const classAvgMastery = sampleMasteryData.length > 0
    ? Math.round(sampleMasteryData.reduce((sum, m) => sum + m.masteryScore, 0) / sampleMasteryData.length)
    : 0;

  // Find weak concepts (average mastery < 60)
  const conceptAverages = concepts.map(concept => {
    const conceptMastery = sampleMasteryData.filter(m => m.conceptId === concept.id);
    const avg = conceptMastery.length > 0
      ? conceptMastery.reduce((sum, m) => sum + m.masteryScore, 0) / conceptMastery.length
      : 0;
    return { concept, average: Math.round(avg), studentCount: conceptMastery.length };
  }).sort((a, b) => a.average - b.average);

  const weakConcepts = conceptAverages.filter(c => c.average < 60 && c.studentCount > 0);

  // Students needing attention (low mastery or declining)
  const studentsNeedingAttention = sampleStudents.filter(student => {
    const studentMastery = sampleMasteryData.filter(m => m.studentId === student.id);
    if (studentMastery.length === 0) return false;
    const avg = studentMastery.reduce((sum, m) => sum + m.masteryScore, 0) / studentMastery.length;
    return avg < 55;
  }).map(student => {
    const studentMastery = sampleMasteryData.filter(m => m.studentId === student.id);
    const avg = Math.round(studentMastery.reduce((sum, m) => sum + m.masteryScore, 0) / studentMastery.length);
    const declining = studentMastery.some(m => m.trend === 'declining');
    return { 
      student, 
      avgMastery: avg,
      reason: declining ? 'Performance declining' : 'Low overall mastery',
      urgency: avg < 40 ? 'high' : declining ? 'medium' : 'low' as const
    };
  });

  return (
    <DashboardLayout userRole="teacher" userName={currentTeacher.name}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Class Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            HTML Fundamentals • {sampleStudents.length} Students
          </p>
        </div>

        {/* Stats Overview */}
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{sampleStudents.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </div>

          <div className="evidence-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="text-2xl font-bold">{studentsNeedingAttention.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Need Attention</div>
          </div>

          <div className="evidence-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-2xl font-bold">{weakConcepts.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Weak Concepts</div>
          </div>
        </div>

        {/* Concept Heatmap */}
        <div className="evidence-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Class Concept Heatmap</h2>
            <Button variant="ghost" size="sm">
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <ConceptHeatmap 
            concepts={concepts} 
            students={sampleStudents} 
            masteryData={sampleMasteryData} 
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Students Needing Attention */}
          <div className="evidence-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Students Needing Attention
            </h2>
            {studentsNeedingAttention.length > 0 ? (
              <div className="space-y-3">
                {studentsNeedingAttention.map(({ student, avgMastery, reason, urgency }) => (
                  <div 
                    key={student.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      urgency === 'high' && "bg-destructive/5 border-destructive/20",
                      urgency === 'medium' && "bg-warning/5 border-warning/20",
                      urgency === 'low' && "bg-muted border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{avgMastery}%</div>
                      <div className={cn(
                        "text-xs font-medium",
                        urgency === 'high' && "text-destructive",
                        urgency === 'medium' && "text-warning",
                        urgency === 'low' && "text-muted-foreground"
                      )}>
                        {urgency} priority
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                All students are on track! 🎉
              </p>
            )}
          </div>

          {/* Weak Concepts */}
          <div className="evidence-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-destructive" />
              Concepts to Re-teach
            </h2>
            {weakConcepts.length > 0 ? (
              <div className="space-y-3">
                {weakConcepts.map(({ concept, average, studentCount }) => (
                  <div 
                    key={concept.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <div className="font-medium">{concept.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {studentCount} students attempted
                      </div>
                    </div>
                    <MasteryRing score={average} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                All concepts are well understood! 🎉
              </p>
            )}
          </div>
        </div>

        {/* Gap Insights */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Learning Insights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sampleGapInsights.slice(0, 4).map((insight) => {
              const student = sampleStudents.find(s => s.id === insight.studentId);
              const concept = concepts.find(c => c.id === insight.conceptId);
              return (
                <InsightCard
                  key={insight.id}
                  insight={{
                    ...insight,
                    description: `${student?.name}: ${insight.description}`
                  }}
                  conceptName={concept?.name}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
