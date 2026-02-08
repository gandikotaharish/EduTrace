import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useConcepts } from "@/hooks/useConcepts";
import { useAllStudents, useAllMastery, useAllInsights } from "@/hooks/useTeacherData";
import { getMasteryLevel } from "@/lib/mastery";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { TrendingUp, TrendingDown, Users, BookOpen, AlertTriangle, Brain, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherAnalytics() {
  const { data: concepts = [], isLoading: cLoading } = useConcepts();
  const { data: students = [], isLoading: sLoading } = useAllStudents();
  const { data: allMastery = [], isLoading: mLoading } = useAllMastery();
  const { data: allInsights = [] } = useAllInsights();

  const isLoading = cLoading || sLoading || mLoading;

  const conceptAvgs = concepts.map(concept => {
    const mastery = allMastery.filter(m => m.concept_id === concept.id);
    const avg = mastery.length > 0 ? Math.round(mastery.reduce((s, m) => s + m.mastery_score, 0) / mastery.length) : 0;
    return { name: concept.name.split(' ').slice(0, 2).join(' '), fullName: concept.name, mastery: avg, students: mastery.length };
  });

  const tiers = [
    { name: 'Expert', min: 90, max: 100, color: '#10b981' },
    { name: 'Proficient', min: 75, max: 89, color: '#14b8a6' },
    { name: 'Developing', min: 55, max: 74, color: '#f59e0b' },
    { name: 'Emerging', min: 35, max: 54, color: '#f97316' },
    { name: 'Novice', min: 0, max: 34, color: '#ef4444' },
  ];
  const masteryDistribution = tiers.map(tier => ({ ...tier, value: allMastery.filter(m => m.mastery_score >= tier.min && m.mastery_score <= tier.max).length }));

  const studentPerformance = students.map(student => {
    const mastery = allMastery.filter(m => m.student_id === student.user_id);
    const avg = mastery.length > 0 ? Math.round(mastery.reduce((s, m) => s + m.mastery_score, 0) / mastery.length) : 0;
    return { name: student.full_name.split(' ')[0], fullName: student.full_name, mastery: avg, concepts: mastery.length };
  }).sort((a, b) => b.mastery - a.mastery);

  const gapTypes = [
    { type: 'Fragile Understanding', count: allInsights.filter(g => g.type === 'fragile_understanding').length, color: '#3b82f6' },
    { type: 'Misconception', count: allInsights.filter(g => g.type === 'misconception').length, color: '#f59e0b' },
    { type: 'Missing Prerequisite', count: allInsights.filter(g => g.type === 'missing_prerequisite').length, color: '#ef4444' },
    { type: 'False Confidence', count: allInsights.filter(g => g.type === 'false_confidence').length, color: '#8b5cf6' },
  ];

  const classAvg = allMastery.length > 0 ? Math.round(allMastery.reduce((s, m) => s + m.mastery_score, 0) / allMastery.length) : 0;
  const improving = allMastery.filter(m => m.trend === 'improving').length;
  const declining = allMastery.filter(m => m.trend === 'declining').length;
  const completionRate = students.length > 0 && concepts.length > 0 ? Math.round((allMastery.filter(m => m.mastery_score >= 75).length / (students.length * concepts.length)) * 100) : 0;

  if (isLoading) {
    return <DashboardLayout><div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div><div className="grid lg:grid-cols-2 gap-6"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div></DashboardLayout>;
  }

  const hasData = allMastery.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Analytics</h1><p className="text-muted-foreground mt-1">Deep insights into class performance, trends, and learning gaps</p></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="evidence-card"><div className="flex items-center gap-3"><MasteryRing score={classAvg} size="sm" showLabel={false} /><div><div className="text-2xl font-bold">{classAvg}%</div><div className="text-sm text-muted-foreground">Class Average</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-500" /></div><div><div className="text-2xl font-bold">{improving}</div><div className="text-sm text-muted-foreground">Improving</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-destructive" /></div><div><div className="text-2xl font-bold">{declining}</div><div className="text-sm text-muted-foreground">Declining</div></div></div></div>
          <div className="evidence-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Target className="w-5 h-5 text-primary" /></div><div><div className="text-2xl font-bold">{completionRate}%</div><div className="text-sm text-muted-foreground">Completion Rate</div></div></div></div>
        </div>

        {!hasData ? (
          <div className="evidence-card text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground">Charts and insights will appear once students start completing concepts.</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="evidence-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Mastery by Concept</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conceptAvgs} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number, _: string, props: any) => [`${value}% (${props.payload.students} students)`, 'Mastery']} />
                      <Bar dataKey="mastery" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="evidence-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Mastery Distribution</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={masteryDistribution.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" nameKey="name" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                        {masteryDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Legend /><RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="evidence-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Student Ranking</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`${value}%`, 'Mastery']} />
                      <Bar dataKey="mastery" radius={[4, 4, 0, 0]}>
                        {studentPerformance.map((entry, index) => <Cell key={index} fill={entry.mastery >= 75 ? '#10b981' : entry.mastery >= 55 ? '#f59e0b' : '#ef4444'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="evidence-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />Learning Gap Types</h2>
                <div className="space-y-4">
                  {gapTypes.map(gap => (
                    <div key={gap.type} className="space-y-1">
                      <div className="flex items-center justify-between text-sm"><span className="font-medium">{gap.type}</span><span className="text-muted-foreground">{gap.count} detected</span></div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${allInsights.length > 0 ? (gap.count / allInsights.length) * 100 : 0}%`, backgroundColor: gap.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium text-sm mb-2">Key Takeaway</h4>
                  <p className="text-sm text-muted-foreground">
                    {allInsights.filter(g => g.severity === 'high').length > 0
                      ? `${allInsights.filter(g => g.severity === 'high').length} high-severity gaps detected. Focus on students with missing prerequisites and false confidence patterns.`
                      : allInsights.length > 0
                        ? 'Monitor detected gaps and address them in upcoming lessons.'
                        : 'No gaps detected yet. Data will appear as students complete more concepts.'}
                  </p>
                </div>
              </div>
            </div>

            {/* At-Risk Students */}
            {studentPerformance.filter(s => s.mastery < 55 && s.mastery > 0).length > 0 && (
              <div className="evidence-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />At-Risk Students</h2>
                <div className="space-y-3">
                  {studentPerformance.filter(s => s.mastery < 55 && s.mastery > 0).sort((a, b) => a.mastery - b.mastery).map(student => {
                    const gaps = allInsights.filter(g => {
                      const s = students.find(st => st.full_name === student.fullName);
                      return s && g.student_id === s.user_id;
                    });
                    return (
                      <div key={student.fullName} className={cn("p-4 rounded-lg border", student.mastery < 40 ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20")}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold text-sm">{student.fullName.split(' ').map(n => n[0]).join('')}</div>
                            <div><div className="font-medium">{student.fullName}</div><div className="text-sm text-muted-foreground">{student.concepts} concepts attempted • {gaps.length} gaps</div></div>
                          </div>
                          <div className="text-right"><div className="text-lg font-bold">{student.mastery}%</div><Badge variant={student.mastery < 40 ? 'destructive' : 'secondary'} className="text-xs">{getMasteryLevel(student.mastery).level}</Badge></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
