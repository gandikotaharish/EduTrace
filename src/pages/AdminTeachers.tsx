import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useAdminUsers, useCreateUser, useResetPassword, useToggleUserActive,
  useSchools, useClasses, useTeacherAssignments, useCreateTeacherAssignment, useDeleteTeacherAssignment,
} from '@/hooks/useAdminData';
import { useSubjects } from '@/hooks/useConcepts';
import { Users, Plus, Loader2, KeyRound, UserX, UserCheck, Link2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { validatePassword, PASSWORD_RULES } from '@/lib/password';

const emailSchema = z.string().email();

export default function AdminTeachers() {
  const { data: allUsers, isLoading } = useAdminUsers();
  const { data: schools } = useSchools();
  const { data: classes } = useClasses();
  const { data: assignments } = useTeacherAssignments();
  const { data: subjects = [] } = useSubjects();

  const createUser = useCreateUser();
  const resetPassword = useResetPassword();
  const toggleActive = useToggleUserActive();
  const createAssignment = useCreateTeacherAssignment();
  const deleteAssignment = useDeleteTeacherAssignment();

  const teachers = allUsers?.filter((u) => u.role === 'teacher') || [];

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [newPassword, setNewPassword] = useState('');
  const [assignForm, setAssignForm] = useState({ school_id: '', class_id: '', subject_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.name = 'Required';
    try { emailSchema.parse(form.email); } catch { newErrors.email = 'Invalid email'; }
    const pwdCheck = validatePassword(form.password);
    if (!pwdCheck.valid) newErrors.password = pwdCheck.message;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    await createUser.mutateAsync({ ...form, role: 'teacher' });
    setShowCreateDialog(false);
    setForm({ email: '', password: '', full_name: '' });
  };

  const handleResetPassword = async () => {
    if (!showResetDialog || !validatePassword(newPassword).valid) return;
    await resetPassword.mutateAsync({ user_id: showResetDialog, new_password: newPassword });
    setShowResetDialog(null);
    setNewPassword('');
  };

  const handleAssign = async () => {
    if (!showAssignDialog || !assignForm.school_id) return;
    await createAssignment.mutateAsync({
      teacher_id: showAssignDialog,
      school_id: assignForm.school_id,
      class_id: assignForm.class_id || undefined,
      subject_id: assignForm.subject_id || undefined,
    });
    setShowAssignDialog(null);
    setAssignForm({ school_id: '', class_id: '', subject_id: '' });
  };

  const filteredClasses = classes?.filter(c => c.school_id === assignForm.school_id) || [];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teacher Management</h1>
            <p className="text-muted-foreground mt-1">Create, manage, and assign teachers</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Create Teacher</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Teacher Account</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Smith" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@school.edu" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={PASSWORD_RULES} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createUser.isPending}>
                  {createUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Teachers ({teachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !teachers.length ? (
              <p className="text-muted-foreground text-center py-8">No teachers yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => {
                    const teacherAssignments = assignments?.filter(a => a.teacher_id === teacher.user_id) || [];
                    return (
                      <TableRow key={teacher.user_id}>
                        <TableCell className="font-medium">{teacher.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacherAssignments.length === 0 && <span className="text-muted-foreground text-sm">None</span>}
                            {teacherAssignments.map(a => (
                              <Badge key={a.id} variant="outline" className="text-xs">
                                {(a as any).schools?.name}{(a as any).classes?.name ? ` / ${(a as any).classes.name}` : ''}
                                <button onClick={() => deleteAssignment.mutate(a.id)} className="ml-1 text-destructive hover:text-destructive/80">×</button>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {teacher.last_sign_in_at ? new Date(teacher.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.is_active && !teacher.banned ? 'default' : 'secondary'}>
                            {teacher.is_active && !teacher.banned ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" title="Assign" onClick={() => setShowAssignDialog(teacher.user_id)}>
                              <Link2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Reset Password" onClick={() => setShowResetDialog(teacher.user_id)}>
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              title={teacher.is_active ? 'Disable' : 'Enable'}
                              onClick={() => toggleActive.mutate({ user_id: teacher.user_id, is_active: !teacher.is_active })}
                            >
                              {teacher.is_active ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={!!showResetDialog} onOpenChange={(o) => { if (!o) setShowResetDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{PASSWORD_RULES}</p>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleResetPassword} disabled={resetPassword.isPending || !validatePassword(newPassword).valid}>
              {resetPassword.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={!!showAssignDialog} onOpenChange={(o) => { if (!o) setShowAssignDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Teacher</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>School *</Label>
              <Select value={assignForm.school_id} onValueChange={(v) => setAssignForm({ ...assignForm, school_id: v, class_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schools?.filter(s => s.is_active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class (optional)</Label>
              <Select value={assignForm.class_id} onValueChange={(v) => setAssignForm({ ...assignForm, class_id: v })}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  {filteredClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject (optional)</Label>
              <Select value={assignForm.subject_id} onValueChange={(v) => setAssignForm({ ...assignForm, subject_id: v })}>
                <SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign} disabled={createAssignment.isPending || !assignForm.school_id}>
              {createAssignment.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
