import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { Progress } from "@/components/ui/progress";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  AlertTriangle,
  Brain,
  Target,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Prepare analytics data
function useAnalyticsData() {
  // Concept mastery averages
  const conceptAvgs = concepts.map((concept) => {
    const mastery = sampleMasteryData.filter(
      (m) => m.conceptId === concept.id
    );
    const avg =
      mastery.length > 0
        ? Math.round(
            mastery.reduce((sum, m) => sum + m.masteryScore, 0) /
              mastery.length
          )
        : 0;
    return {
      name: concept.name.split(" ").slice(0, 2).join(" "),
      fullName: concept.name,
      mastery: avg,
      students: mastery.length,
    };
  });

  // Mastery distribution
  const tiers = [
    { name: "Expert", min: 90, max: 100, color: "#10b981" },
    { name: "Proficient", min: 75, max: 89, color: "#14b8a6" },
    { name: "Developing", min: 55, max: 74, color: "#f59e0b" },
    { name: "Emerging", min: 35, max: 54, color: "#f97316" },
    { name: "Novice", min: 0, max: 34, color: "#ef4444" },
  ];

  const masteryDistribution = tiers.map((tier) => ({
    ...tier,
    value: sampleMasteryData.filter(
      (m) => m.masteryScore >= tier.min && m.masteryScore <= tier.max
    ).length,
  }));

  // Student performance ranking
  const studentPerformance = sampleStudents
    .map((student) => {
      const mastery = sampleMasteryData.filter(
        (m) => m.studentId === student.id
      );
      const avg =
        mastery.length > 0
          ? Math.round(
              mastery.reduce((sum, m) => sum + m.masteryScore, 0) /
                mastery.length
            )
          : 0;
      return {
        name: student.name.split(" ")[0],
        fullName: student.name,
        mastery: avg,
        concepts: mastery.length,
      };
    })
    .sort((a, b) => b.mastery - a.mastery);

  // Trend data (simulated weekly progress)
  const weeklyTrend = [
    { week: "Week 1", average: 35, engagement: 60 },
    { week: "Week 2", average: 42, engagement: 72 },
    { week: "Week 3", average: 48, engagement: 68 },
    { week: "Week 4", average: 55, engagement: 80 },
    { week: "Week 5", average: 58, engagement: 75 },
    { week: "Week 6", average: 62, engagement: 85 },
  ];

  // Gap type distribution
  const gapTypes = [
    {
      type: "Fragile Understanding",
      count: sampleGapInsights.filter(
        (g) => g.type === "fragile_understanding"
      ).length,
      color: "#3b82f6",
    },
    {
      type: "Misconception",
      count: sampleGapInsights.filter((g) => g.type === "misconception")
        .length,
      color: "#f59e0b",
    },
    {
      type: "Missing Prerequisite",
      count: sampleGapInsights.filter(
        (g) => g.type === "missing_prerequisite"
      ).length,
      color: "#ef4444",
    },
    {
      type: "False Confidence",
      count: sampleGapInsights.filter(
        (g) => g.type === "false_confidence"
      ).length,
      color: "#8b5cf6",
    },
  ];

  // Class-wide stats
  const classAvg =
    sampleMasteryData.length > 0
      ? Math.round(
          sampleMasteryData.reduce((sum, m) => sum + m.masteryScore, 0) /
            sampleMasteryData.length
        )
      : 0;
  const improving = sampleMasteryData.filter(
    (m) => m.trend === "improving"
  ).length;
  const declining = sampleMasteryData.filter(
    (m) => m.trend === "declining"
  ).length;
  const completionRate = Math.round(
    (sampleMasteryData.filter((m) => m.masteryScore >= 75).length /
      (sampleStudents.length * concepts.length)) *
      100
  );

  return {
    conceptAvgs,
    masteryDistribution,
    studentPerformance,
    weeklyTrend,
    gapTypes,
    classAvg,
    improving,
    declining,
    completionRate,
  };
}

export default function TeacherAnalytics() {
  const data = useAnalyticsData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into class performance, trends, and learning gaps
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <MasteryRing
                score={data.classAvg}
                size="sm"
                showLabel={false}
              />
              <div>
                <div className="text-2xl font-bold">{data.classAvg}%</div>
                <div className="text-sm text-muted-foreground">
                  Class Average
                </div>
              </div>
            </div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.improving}</div>
                <div className="text-sm text-muted-foreground">
                  Improving Scores
                </div>
              </div>
            </div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.declining}</div>
                <div className="text-sm text-muted-foreground">
                  Declining Scores
                </div>
              </div>
            </div>
          </div>
          <div className="evidence-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {data.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Completion Rate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Concept Mastery Bar Chart */}
          <div className="evidence-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Mastery by Concept
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.conceptAvgs} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, _name: string, props: any) => [
                      `${value}% (${props.payload.students} students)`,
                      "Mastery",
                    ]}
                    labelFormatter={(label) => {
                      const item = data.conceptAvgs.find((c) => c.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Bar dataKey="mastery" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mastery Distribution Pie */}
          <div className="evidence-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Mastery Distribution
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.masteryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) =>
                      value > 0 ? `${name}: ${value}` : ""
                    }
                    labelLine={false}
                  >
                    {data.masteryDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="evidence-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Progress Trend
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Avg Mastery"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Engagement"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Performance Ranking */}
          <div className="evidence-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Student Ranking
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.studentPerformance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Mastery"]}
                    labelFormatter={(label) => {
                      const item = data.studentPerformance.find(
                        (s) => s.name === label
                      );
                      return item?.fullName || label;
                    }}
                  />
                  <Bar dataKey="mastery" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))">
                    {data.studentPerformance.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.mastery >= 75
                            ? "#10b981"
                            : entry.mastery >= 55
                            ? "#f59e0b"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Gap Types */}
          <div className="evidence-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Learning Gap Types
            </h2>
            <div className="space-y-4">
              {data.gapTypes.map((gap) => (
                <div key={gap.type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{gap.type}</span>
                    <span className="text-muted-foreground">
                      {gap.count} detected
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${
                          sampleGapInsights.length > 0
                            ? (gap.count / sampleGapInsights.length) * 100
                            : 0
                        }%`,
                        backgroundColor: gap.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-medium text-sm mb-2">
                Key Takeaway
              </h4>
              <p className="text-sm text-muted-foreground">
                {sampleGapInsights.filter((g) => g.severity === "high")
                  .length > 0
                  ? `${
                      sampleGapInsights.filter(
                        (g) => g.severity === "high"
                      ).length
                    } high-severity gaps detected. Focus on students with missing prerequisites and false confidence patterns.`
                  : "No critical gaps detected. Continue monitoring for early signs of misconceptions."}
              </p>
            </div>
          </div>

          {/* At-Risk Students */}
          <div className="evidence-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              At-Risk Students
            </h2>
            <div className="space-y-3">
              {data.studentPerformance
                .filter((s) => s.mastery < 55)
                .sort((a, b) => a.mastery - b.mastery)
                .map((student) => {
                  const gaps = sampleGapInsights.filter((g) => {
                    const s = sampleStudents.find(
                      (st) => st.name === student.fullName
                    );
                    return s && g.studentId === s.id;
                  });

                  return (
                    <div
                      key={student.fullName}
                      className={cn(
                        "p-4 rounded-lg border",
                        student.mastery < 40
                          ? "bg-destructive/5 border-destructive/20"
                          : "bg-warning/5 border-warning/20"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">
                          {student.fullName}
                        </span>
                        <Badge
                          variant={
                            student.mastery < 40 ? "destructive" : "secondary"
                          }
                        >
                          {student.mastery}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{student.concepts} concepts attempted</span>
                        {gaps.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-destructive">
                              {gaps.length} gap
                              {gaps.length > 1 ? "s" : ""} detected
                            </span>
                          </>
                        )}
                      </div>
                      <Progress
                        value={student.mastery}
                        className="h-2 mt-2"
                      />
                    </div>
                  );
                })}
              {data.studentPerformance.filter((s) => s.mastery < 55)
                .length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No at-risk students! All students are above 55% mastery.
                  🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
