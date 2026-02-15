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
  useSchools, useClasses, useStudentAssignments, useCreateStudentAssignment, useDeleteStudentAssignment,
} from '@/hooks/useAdminData';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Plus, Loader2, KeyRound, UserX, UserCheck, Link2, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { validatePassword, PASSWORD_RULES } from '@/lib/password';

const emailSchema = z.string().email();

export default function AdminStudents() {
  const { data: allUsers, isLoading } = useAdminUsers();
  const { data: schools } = useSchools();
  const { data: classes } = useClasses();
  const { data: assignments } = useStudentAssignments();

  const createUser = useCreateUser();
  const resetPassword = useResetPassword();
  const toggleActive = useToggleUserActive();
  const createAssignment = useCreateStudentAssignment();
  const deleteAssignment = useDeleteStudentAssignment();

  const students = allUsers?.filter((u) => u.role === 'student') || [];

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [newPassword, setNewPassword] = useState('');
  const [assignForm, setAssignForm] = useState({ school_id: '', class_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkDefaultPassword, setBulkDefaultPassword] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; errors: string[] } | null>(null);
  const { toast } = useToast();

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.name = 'Required';
    try { emailSchema.parse(form.email); } catch { newErrors.email = 'Invalid email'; }
    if (!validatePassword(form.password).valid) newErrors.password = validatePassword(form.password).message;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    await createUser.mutateAsync({ ...form, role: 'student' });
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
    if (!showAssignDialog || !assignForm.school_id || !assignForm.class_id) return;
    await createAssignment.mutateAsync({
      student_id: showAssignDialog,
      school_id: assignForm.school_id,
      class_id: assignForm.class_id,
    });
    setShowAssignDialog(null);
    setAssignForm({ school_id: '', class_id: '' });
  };

  const filteredClasses = classes?.filter(c => c.school_id === assignForm.school_id) || [];

  const parseCsv = (text: string): { email: string; full_name: string; password?: string }[] => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const emailIdx = header.findIndex((h) => h === 'email' || h === 'email address');
    const nameIdx = header.findIndex((h) => h === 'name' || h === 'full_name' || h === 'full name');
    const pwdIdx = header.findIndex((h) => h === 'password');
    if (emailIdx < 0) return [];
    return lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      return {
        email: cols[emailIdx] || '',
        full_name: nameIdx >= 0 ? cols[nameIdx] || cols[emailIdx]?.split('@')[0] || 'Student' : cols[emailIdx]?.split('@')[0] || 'Student',
        password: pwdIdx >= 0 && cols[pwdIdx] ? cols[pwdIdx] : undefined,
      };
    }).filter((r) => r.email);
  };

  const handleBulkUpload = async () => {
    const defaultPwd = bulkDefaultPassword.trim() || 'ChangeMe123!';
    const rows = parseCsv(bulkCsv);
    if (rows.length === 0) {
      toast({ title: 'Invalid CSV', description: 'Need at least a header with "email" and one data row.', variant: 'destructive' });
      return;
    }
    setBulkProgress({ done: 0, total: rows.length, errors: [] });
    const errs: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const password = row.password || defaultPwd;
      try {
        await createUser.mutateAsync({ email: row.email, password, full_name: row.full_name, role: 'student' });
      } catch (e: unknown) {
        errs.push(`Row ${i + 2}: ${row.email} — ${e instanceof Error ? e.message : 'Error'}`);
      }
      setBulkProgress((p) => p ? { ...p, done: i + 1, errors: errs } : null);
    }
    setBulkProgress((p) => p ? { ...p, errors: errs } : null);
    toast({ title: 'Bulk upload done', description: `${rows.length - errs.length} created, ${errs.length} failed.` });
    if (errs.length === 0) setShowBulkDialog(false);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground mt-1">Create, manage, and assign students to classes</p>
          </div>
          <Dialog open={showBulkDialog} onOpenChange={(o) => { setShowBulkDialog(o); if (!o) setBulkProgress(null); }}>
            <DialogTrigger asChild>
              <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Bulk upload CSV</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Bulk Create Students (CSV)</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">CSV must have header with <strong>email</strong> and optionally <strong>name</strong> (or full_name), <strong>password</strong>. Otherwise a default password is used.</p>
              <div className="space-y-2">
                <Label>Default password (if column not in CSV)</Label>
                <Input type="password" value={bulkDefaultPassword} onChange={(e) => setBulkDefaultPassword(e.target.value)} placeholder="e.g. ChangeMe123!" />
              </div>
              <Textarea value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} placeholder="email,full_name,password&#10;alex@school.edu,Alex Johnson,&#10;jane@school.edu,Jane Doe," className="min-h-[120px] font-mono text-sm" />
              {bulkProgress && (
                <div className="text-sm">
                  <p>Progress: {bulkProgress.done} / {bulkProgress.total}</p>
                  {bulkProgress.errors.length > 0 && (
                    <div className="mt-2 max-h-24 overflow-y-auto text-destructive text-xs">
                      {bulkProgress.errors.map((e, i) => <div key={i}>{e}</div>)}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
                <Button onClick={handleBulkUpload} disabled={bulkProgress !== null && bulkProgress.done < bulkProgress.total}>
                  {bulkProgress && bulkProgress.done < bulkProgress.total ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Create Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Student Account</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Alex Johnson" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@school.edu" />
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Students ({students.length})
              </CardTitle>
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !filteredStudents.length ? (
              <p className="text-muted-foreground text-center py-8">
                {searchQuery ? 'No students match your search.' : 'No students yet.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>School / Class</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const studentAssignments = assignments?.filter(a => a.student_id === student.user_id) || [];
                    return (
                      <TableRow key={student.user_id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{student.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {studentAssignments.length === 0 && <span className="text-muted-foreground text-sm">Unassigned</span>}
                            {studentAssignments.map(a => (
                              <Badge key={a.id} variant="outline" className="text-xs">
                                {(a as any).schools?.name} / {(a as any).classes?.name}
                                <button onClick={() => deleteAssignment.mutate(a.id)} className="ml-1 text-destructive hover:text-destructive/80">×</button>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {student.last_sign_in_at ? new Date(student.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.is_active && !student.banned ? 'default' : 'secondary'}>
                            {student.is_active && !student.banned ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" title="Assign" onClick={() => setShowAssignDialog(student.user_id)}>
                              <Link2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Reset Password" onClick={() => setShowResetDialog(student.user_id)}>
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => toggleActive.mutate({ user_id: student.user_id, is_active: !student.is_active })}
                            >
                              {student.is_active ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
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
          <DialogHeader><DialogTitle>Assign Student to Class</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>School *</Label>
              <Select value={assignForm.school_id} onValueChange={(v) => setAssignForm({ school_id: v, class_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schools?.filter(s => s.is_active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={assignForm.class_id} onValueChange={(v) => setAssignForm({ ...assignForm, class_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {filteredClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign} disabled={createAssignment.isPending || !assignForm.school_id || !assignForm.class_id}>
              {createAssignment.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
