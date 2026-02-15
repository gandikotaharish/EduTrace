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
import { useSchools, useCreateSchool, useUpdateSchool, useClasses, useCreateClass, useUpdateClass, useStudentAssignments, useTeacherAssignments, useClassTeacherAssignments, useSetClassTeacher, useAdminUsers } from '@/hooks/useAdminData';
import { School, Plus, Pencil, Loader2, MapPin, Building, BookOpen, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const academicLevels = ['K-12', 'Primary', 'Secondary', 'High School', 'University'];

export default function AdminSchools() {
  const { data: schools, isLoading } = useSchools();
  const { data: classes } = useClasses();
  const { data: studentAssignments } = useStudentAssignments();
  const { data: teacherAssignments } = useTeacherAssignments();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const { data: classTeachers } = useClassTeacherAssignments();
  const setClassTeacher = useSetClassTeacher();
  const { data: allUsers } = useAdminUsers();
  const teachers = allUsers?.filter((u: { role: string }) => u.role === 'teacher') || [];
  const [showClassTeacherDialog, setShowClassTeacherDialog] = useState<{ classId: string; className: string } | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [showSchoolDialog, setShowSchoolDialog] = useState(false);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [schoolForm, setSchoolForm] = useState({ name: '', location: '', academic_level: 'K-12' });
  const [classForm, setClassForm] = useState({ school_id: '', name: '', grade_level: '', section: '' });

  const handleSaveSchool = async () => {
    if (!schoolForm.name.trim()) return;
    if (editingSchool) {
      await updateSchool.mutateAsync({ id: editingSchool.id, ...schoolForm });
    } else {
      await createSchool.mutateAsync(schoolForm);
    }
    setShowSchoolDialog(false);
    setEditingSchool(null);
    setSchoolForm({ name: '', location: '', academic_level: 'K-12' });
  };

  const handleSaveClass = async () => {
    if (!classForm.name.trim() || !classForm.school_id) return;
    await createClass.mutateAsync(classForm);
    setShowClassDialog(false);
    setClassForm({ school_id: '', name: '', grade_level: '', section: '' });
  };

  const openEditSchool = (school: any) => {
    setEditingSchool(school);
    setSchoolForm({ name: school.name, location: school.location || '', academic_level: school.academic_level });
    setShowSchoolDialog(true);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">School Management</h1>
            <p className="text-muted-foreground mt-1">Add, edit, and manage schools across the platform</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showClassDialog} onOpenChange={setShowClassDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setClassForm({ school_id: '', name: '', grade_level: '', section: '' })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>School *</Label>
                    <Select value={classForm.school_id} onValueChange={(v) => setClassForm({ ...classForm, school_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                      <SelectContent>
                        {schools?.filter(s => s.is_active).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Class Name *</Label>
                    <Input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Grade 10 - A" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grade Level</Label>
                      <Input value={classForm.grade_level} onChange={(e) => setClassForm({ ...classForm, grade_level: e.target.value })} placeholder="e.g. 10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Input value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} placeholder="e.g. A" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveClass} disabled={createClass.isPending || !classForm.name || !classForm.school_id}>
                    {createClass.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Class
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showSchoolDialog} onOpenChange={(o) => { setShowSchoolDialog(o); if (!o) setEditingSchool(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingSchool(null); setSchoolForm({ name: '', location: '', academic_level: 'K-12' }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add School
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>School Name *</Label>
                    <Input value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} placeholder="e.g. Springfield Academy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={schoolForm.location} onChange={(e) => setSchoolForm({ ...schoolForm, location: e.target.value })} placeholder="e.g. New York, NY" />
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Level</Label>
                    <Select value={schoolForm.academic_level} onValueChange={(v) => setSchoolForm({ ...schoolForm, academic_level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {academicLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveSchool} disabled={createSchool.isPending || updateSchool.isPending || !schoolForm.name}>
                    {(createSchool.isPending || updateSchool.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingSchool ? 'Save Changes' : 'Create School'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Schools Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Schools ({schools?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : !schools?.length ? (
              <p className="text-muted-foreground text-center py-8">No schools yet. Add your first school to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Teachers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => {
                    const schoolClasses = classes?.filter(c => c.school_id === school.id) || [];
                    const schoolStudentIds = new Set((studentAssignments || []).filter((a: { school_id: string }) => a.school_id === school.id).map((a: { student_id: string }) => a.student_id));
                    const schoolTeacherIds = new Set((teacherAssignments || []).filter((a: { school_id: string }) => a.school_id === school.id).map((a: { teacher_id: string }) => a.teacher_id));
                    return (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            {school.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {school.location ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {school.location}
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell><Badge variant="outline">{school.academic_level}</Badge></TableCell>
                        <TableCell>{schoolClasses.length}</TableCell>
                        <TableCell>{schoolStudentIds.size}</TableCell>
                        <TableCell>{schoolTeacherIds.size}</TableCell>
                        <TableCell>
                          <Badge variant={school.is_active ? 'default' : 'secondary'}>
                            {school.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditSchool(school)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSchool.mutate({ id: school.id, is_active: !school.is_active })}
                            >
                              {school.is_active ? 'Deactivate' : 'Activate'}
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

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              All Classes ({classes?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!classes?.length ? (
              <p className="text-muted-foreground text-center py-8">No classes yet. Create a class within a school.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls: { id: string; name: string; schools?: { name: string }; grade_level?: string; section?: string; is_active: boolean }) => {
                    const cta = classTeachers?.find((ct: { class_id: string }) => ct.class_id === cls.id);
                    const teacher = cta ? teachers.find((t: { user_id: string }) => t.user_id === (cta as { teacher_id: string }).teacher_id) : null;
                    return (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.schools?.name || '—'}</TableCell>
                      <TableCell>{cls.grade_level || '—'}</TableCell>
                      <TableCell>{cls.section || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {teacher ? teacher.full_name : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cls.is_active ? 'default' : 'secondary'}>
                          {cls.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Assign class teacher"
                          onClick={() => { setShowClassTeacherDialog({ classId: cls.id, className: cls.name }); setSelectedTeacherId(cta ? (cta as { teacher_id: string }).teacher_id : ''); }}
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateClass.mutate({ id: cls.id, is_active: !cls.is_active })}
                        >
                          {cls.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ); })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign Class Teacher Dialog */}
        <Dialog open={!!showClassTeacherDialog} onOpenChange={(o) => { if (!o) setShowClassTeacherDialog(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Assign Class Teacher</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Class: {showClassTeacherDialog?.className}</p>
            <div className="space-y-2 py-4">
              <Label>Class Teacher</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t: { user_id: string; full_name: string }) => (
                    <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClassTeacherDialog(null)}>Cancel</Button>
              <Button onClick={() => {
                if (showClassTeacherDialog && selectedTeacherId) {
                  setClassTeacher.mutate({ class_id: showClassTeacherDialog.classId, teacher_id: selectedTeacherId });
                  setShowClassTeacherDialog(null);
                }
              }} disabled={!selectedTeacherId || setClassTeacher.isPending}>
                {setClassTeacher.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
