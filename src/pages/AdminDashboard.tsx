import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformStats, usePlatformMonitoring } from '@/hooks/useAdminData';
import { School, Users, GraduationCap, BookOpen, TrendingUp, Activity, Shield, BarChart3, AlertTriangle, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDashboard() {
  const { data: stats, isLoading } = usePlatformStats();
  const { data: monitoring, isLoading: monitoringLoading } = usePlatformMonitoring();

  const statCards = [
    { label: 'Total Schools', value: stats?.totalSchools || 0, icon: School, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Schools', value: stats?.activeSchools || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Total Classes', value: stats?.totalClasses || 0, icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Avg. Mastery', value: `${stats?.averageMastery || 0}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Learning Records', value: stats?.totalEvidence || 0, icon: BarChart3, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Admins', value: stats?.totalAdmins || 0, icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">
            Centralized management dashboard for all schools and users
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border">
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickAction href="/admin/schools" icon={School} label="Manage Schools" desc="Add, edit, or deactivate schools" />
              <QuickAction href="/admin/teachers" icon={Users} label="Manage Teachers" desc="Create accounts, assign to schools & classes" />
              <QuickAction href="/admin/students" icon={GraduationCap} label="Manage Students" desc="Create accounts, assign to classes" />
              <QuickAction href="/admin/subjects" icon={BookOpen} label="Manage Subjects & Concepts" desc="Create subjects, define concept hierarchies" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthItem label="Database" status="Operational" />
              <HealthItem label="Authentication" status="Operational" />
              <HealthItem label="Learning Engine" status="Operational" />
              <HealthItem label="Analytics Pipeline" status="Operational" />
            </CardContent>
          </Card>
        </div>

        {/* Platform Monitoring */}
        {monitoring && (monitoring.difficultConcepts.length > 0 || monitoring.masteryBySchool.some((s) => s.avg_mastery != null)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Most Difficult Concepts (by avg mastery)
                </CardTitle>
                <p className="text-sm text-muted-foreground">Concepts with lowest average mastery across the platform</p>
              </CardHeader>
              <CardContent>
                {monitoringLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : monitoring.difficultConcepts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No mastery data yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concept</TableHead>
                        <TableHead className="text-right">Avg Mastery</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monitoring.difficultConcepts.map((c) => (
                        <TableRow key={c.concept_id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-right">{c.avg_mastery ?? '—'}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Average Mastery by School
                </CardTitle>
                <p className="text-sm text-muted-foreground">Aggregated by school (no student-level detail)</p>
              </CardHeader>
              <CardContent>
                {monitoringLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead className="text-right">Avg Mastery</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monitoring.masteryBySchool.map((s) => (
                        <TableRow key={s.school_id}>
                          <TableCell className="font-medium">{s.school_name}</TableCell>
                          <TableCell className="text-right">{s.avg_mastery != null ? `${s.avg_mastery}%` : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function QuickAction({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </a>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {status}
      </span>
    </div>
  );
}
