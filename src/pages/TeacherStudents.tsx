import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  concepts,
  sampleStudents,
  sampleMasteryData,
  sampleGapInsights,
  getMasteryLevel,
  getMasteryColorClass,
} from "@/data/sampleData";
import {
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDetail {
  student: (typeof sampleStudents)[0];
  avgMastery: number;
  conceptsAttempted: number;
  conceptsMastered: number;
  trend: "improving" | "stable" | "declining";
  insights: typeof sampleGapInsights;
  conceptBreakdown: Array<{
    concept: (typeof concepts)[0];
    score: number;
    trend: "improving" | "stable" | "declining";
  }>;
}

function getStudentDetails(): StudentDetail[] {
  return sampleStudents.map((student) => {
    const studentMastery = sampleMasteryData.filter(
      (m) => m.studentId === student.id
    );
    const avgMastery =
      studentMastery.length > 0
        ? Math.round(
            studentMastery.reduce((sum, m) => sum + m.masteryScore, 0) /
              studentMastery.length
          )
        : 0;
    const conceptsMastered = studentMastery.filter(
      (m) => m.masteryScore >= 75
    ).length;
    const improving = studentMastery.filter(
      (m) => m.trend === "improving"
    ).length;
    const declining = studentMastery.filter(
      (m) => m.trend === "declining"
    ).length;
    const trend: "improving" | "stable" | "declining" =
      improving > declining
        ? "improving"
        : declining > improving
        ? "declining"
        : "stable";

    const insights = sampleGapInsights.filter(
      (g) => g.studentId === student.id
    );

    const conceptBreakdown = concepts
      .map((concept) => {
        const mastery = studentMastery.find(
          (m) => m.conceptId === concept.id
        );
        return mastery
          ? {
              concept,
              score: mastery.masteryScore,
              trend: mastery.trend,
            }
          : null;
      })
      .filter(Boolean) as StudentDetail["conceptBreakdown"];

    return {
      student,
      avgMastery,
      conceptsAttempted: studentMastery.length,
      conceptsMastered,
      trend,
      insights,
      conceptBreakdown,
    };
  });
}

export default function TeacherStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "mastery" | "attention">(
    "mastery"
  );

  const studentDetails = getStudentDetails();

  const filtered = studentDetails
    .filter((s) =>
      s.student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name")
        return a.student.name.localeCompare(b.student.name);
      if (sortBy === "mastery") return b.avgMastery - a.avgMastery;
      return a.avgMastery - b.avgMastery; // attention = lowest first
    });

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "improving")
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === "declining")
      return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground mt-1">
            Monitor individual student progress and learning gaps
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {sampleStudents.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Students
                </div>
              </div>
            </div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {studentDetails.filter((s) => s.avgMastery >= 75).length}
                </div>
                <div className="text-sm text-muted-foreground">On Track</div>
              </div>
            </div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {studentDetails.filter((s) => s.avgMastery < 55).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Need Attention
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                { key: "mastery", label: "Mastery" },
                { key: "attention", label: "Needs Help" },
                { key: "name", label: "Name" },
              ] as const
            ).map((sort) => (
              <Button
                key={sort.key}
                variant={sortBy === sort.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(sort.key)}
              >
                {sort.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {filtered.map(
            ({
              student,
              avgMastery,
              conceptsAttempted,
              conceptsMastered,
              trend,
              insights,
              conceptBreakdown,
            }) => {
              const isExpanded = expandedStudent === student.id;
              const { level } = getMasteryLevel(avgMastery);

              return (
                <div
                  key={student.id}
                  className="evidence-card !p-0 overflow-hidden"
                >
                  {/* Main Row */}
                  <button
                    onClick={() =>
                      setExpandedStudent(isExpanded ? null : student.id)
                    }
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {student.name}
                        </span>
                        <TrendIcon trend={trend} />
                        {insights.length > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-xs px-1.5 py-0"
                          >
                            {insights.length} gap
                            {insights.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {conceptsMastered}/{concepts.length} concepts mastered •{" "}
                        {level}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={avgMastery} className="h-2" />
                      </div>
                      <span className="text-lg font-bold w-12 text-right">
                        {avgMastery}%
                      </span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-border p-5 bg-muted/10 space-y-5">
                      {/* Student Info */}
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <MasteryRing score={avgMastery} size="md" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {student.email}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-lg bg-card border border-border">
                              <div className="text-xl font-bold">
                                {conceptsAttempted}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Attempted
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-card border border-border">
                              <div className="text-xl font-bold text-emerald-500">
                                {conceptsMastered}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Mastered
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-card border border-border">
                              <div className="text-xl font-bold">
                                {concepts.length - conceptsAttempted}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Not Started
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Concept Breakdown */}
                      {conceptBreakdown.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">
                            Concept Breakdown
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {conceptBreakdown.map(
                              ({ concept, score, trend: cTrend }) => (
                                <div
                                  key={concept.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={cn(
                                        "w-3 h-3 rounded-full shrink-0",
                                        getMasteryColorClass(score)
                                      )}
                                    />
                                    <span className="text-sm font-medium truncate">
                                      {concept.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <TrendIcon trend={cTrend} />
                                    <span className="text-sm font-bold">
                                      {score}%
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Insights */}
                      {insights.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">
                            Learning Gaps Detected
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {insights.map((insight) => {
                              const concept = concepts.find(
                                (c) => c.id === insight.conceptId
                              );
                              return (
                                <InsightCard
                                  key={insight.id}
                                  insight={insight}
                                  conceptName={concept?.name}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
