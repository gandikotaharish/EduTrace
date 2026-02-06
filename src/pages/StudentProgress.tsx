import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  concepts, 
  sampleMasteryData,
  sampleGapInsights,
  getMasteryLevel
} from "@/data/sampleData";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function StudentProgress() {
  const { userName } = useAuth();
  
  // For now, use first sample student's data
  const sampleStudentId = 'student-1';
  const studentMastery = sampleMasteryData.filter(m => m.studentId === sampleStudentId);
  const studentInsights = sampleGapInsights.filter(i => i.studentId === sampleStudentId);
  
  // Calculate stats
  const overallMastery = studentMastery.length > 0
    ? Math.round(studentMastery.reduce((sum, m) => sum + m.masteryScore, 0) / studentMastery.length)
    : 0;
  
  const completedCount = studentMastery.filter(m => m.masteryScore >= 75).length;
  const inProgressCount = studentMastery.filter(m => m.masteryScore > 0 && m.masteryScore < 75).length;
  const totalConcepts = concepts.length;
  const completionRate = Math.round((completedCount / totalConcepts) * 100);
  
  // Trend analysis
  const improvingCount = studentMastery.filter(m => m.trend === 'improving').length;
  const decliningCount = studentMastery.filter(m => m.trend === 'declining').length;
  
  // Time stats (mock data)
  const totalTimeSpent = studentMastery.reduce((sum, m) => sum + (m.evidenceCount * 15), 0); // ~15 min per evidence
  const avgSessionTime = Math.round(totalTimeSpent / Math.max(studentMastery.length, 1));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMasteryColorClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-teal-500';
    if (score >= 55) return 'bg-amber-500';
    if (score >= 35) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and identify areas for improvement.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Mastery</p>
                  <p className="text-3xl font-bold">{overallMastery}%</p>
                </div>
                <MasteryRing score={overallMastery} size="sm" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}/{totalConcepts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">{totalTimeSpent}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Improving</p>
                  <p className="text-2xl font-bold">{improvingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Course Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{completionRate}% Complete</span>
                <span>{completedCount} of {totalConcepts} concepts mastered</span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Mastered ({completedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>In Progress ({inProgressCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span>Not Started ({totalConcepts - studentMastery.length})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Concept Mastery List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Concept Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {concepts.map((concept) => {
                  const mastery = studentMastery.find(m => m.conceptId === concept.id);
                  const score = mastery?.masteryScore || 0;
                  const level = getMasteryLevel(score);
                  
                  return (
                    <div key={concept.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{concept.name}</span>
                          {mastery && getTrendIcon(mastery.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {level.level}
                          </Badge>
                          <span className="text-sm font-medium w-10 text-right">{score}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", getMasteryColorClass(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Learning Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Learning Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentInsights.length > 0 ? (
                <div className="space-y-4">
                  {studentInsights.map((insight) => {
                    const concept = concepts.find(c => c.id === insight.conceptId);
                    
                    return (
                      <div 
                        key={insight.id} 
                        className={cn(
                          "p-4 rounded-lg border-l-4",
                          insight.severity === 'high' && "bg-destructive/5 border-destructive",
                          insight.severity === 'medium' && "bg-warning/5 border-warning",
                          insight.severity === 'low' && "bg-info/5 border-info"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn(
                            "w-5 h-5 mt-0.5",
                            insight.severity === 'high' && "text-destructive",
                            insight.severity === 'medium' && "text-warning",
                            insight.severity === 'low' && "text-info"
                          )} />
                          <div>
                            <p className="font-medium text-sm">{concept?.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            <p className="text-xs text-primary mt-2">
                              💡 {insight.suggestedAction}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success/50" />
                  <p>No learning gaps detected!</p>
                  <p className="text-sm">Keep up the great work.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentMastery.slice(0, 5).map((mastery, index) => {
                const concept = concepts.find(c => c.id === mastery.conceptId);
                const level = getMasteryLevel(mastery.masteryScore);
                
                return (
                  <div key={mastery.conceptId} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        getMasteryColorClass(mastery.masteryScore)
                      )} />
                      <div>
                        <p className="font-medium">{concept?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {mastery.evidenceCount} learning activities completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getTrendIcon(mastery.trend)}
                      <Badge variant={mastery.masteryScore >= 75 ? "default" : "secondary"}>
                        {mastery.masteryScore}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
