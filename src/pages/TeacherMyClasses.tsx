import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyClassTeacherClasses, useStudentsInClass, useTeacherCreateStudents } from "@/hooks/useTeacherClass";
import { useAllMastery } from "@/hooks/useTeacherData";
import { useAllIntegrityScores } from "@/hooks/useIntegrity";
import {
  Users,
  School,
  UserPlus,
  Download,
  Loader2,
  AlertCircle,
  BookOpen,
  Shield,
} from "lucide-react";

function downloadCredentialCsv(created: Array<{ email: string; password: string; full_name: string }>, className: string) {
  const headers = "Email,Password,Full Name\n";
  const rows = created.map((r) => `"${r.email}","${r.password}","${(r.full_name || "").replace(/"/g, '""')}"`).join("\n");
  const csv = headers + rows;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `credentials_${className.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TeacherMyClasses() {
  const { data: myClasses = [], isLoading: classesLoading } = useMyClassTeacherClasses();
  const { data: allMastery = [] } = useAllMastery();
  const { data: allIntegrity = [] } = useAllIntegrityScores();
  const createStudents = useTeacherCreateStudents();

  const [addStudentsClass, setAddStudentsClass] = useState<{
    id: string;
    name: string;
    school_id: string;
  } | null>(null);
  const [bulkInput, setBulkInput] = useState("");
  const [lastCreated, setLastCreated] = useState<{
    classId: string;
    className: string;
    created: Array<{ email: string; password: string; full_name: string }>;
  } | null>(null);

  const handleBulkSubmit = () => {
    if (!addStudentsClass) return;
    const lines = bulkInput
      .trim()
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const students = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const email = parts[0] || "";
      const full_name = parts.slice(1).join(" ").trim() || email.split("@")[0];
      return { email, full_name };
    });
    if (students.length === 0) return;
    createStudents.mutate(
      {
        class_id: addStudentsClass.id,
        school_id: addStudentsClass.school_id,
        students,
      },
      {
        onSuccess: (data) => {
          if (data.created?.length) {
            setLastCreated({
              classId: addStudentsClass.id,
              className: addStudentsClass.name,
              created: data.created,
            });
          }
          setAddStudentsClass(null);
          setBulkInput("");
        },
      }
    );
  };

  if (classesLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">
            Classes where you are the class teacher. Add students and download login credentials.
          </p>
        </div>

        {myClasses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <School className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>You are not assigned as class teacher for any class.</p>
              <p className="text-sm mt-1">Ask your admin to assign you as class teacher in Schools → Classes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myClasses.map((cls: { id: string; name: string; school_id: string; schools?: { name: string } }) => (
              <ClassCard
                key={cls.id}
                classId={cls.id}
                className={cls.name}
                schoolName={cls.schools?.name}
                schoolId={cls.school_id}
                allMastery={allMastery}
                allIntegrity={allIntegrity}
                onAddStudents={() =>
                  setAddStudentsClass({ id: cls.id, name: cls.name, school_id: cls.school_id })
                }
                onDownloadCredentials={
                  lastCreated?.classId === cls.id
                    ? () => downloadCredentialCsv(lastCreated.created, lastCreated.className)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Add Students Dialog */}
        <Dialog open={!!addStudentsClass} onOpenChange={(o) => !o && setAddStudentsClass(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add students to {addStudentsClass?.name}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              One student per line: <strong>email, Full Name</strong> (e.g. ravi@school.com, Ravi Kumar)
            </p>
            <div className="space-y-2">
              <Label>Students</Label>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="student1@school.com, Student One&#10;student2@school.com, Student Two"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddStudentsClass(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkSubmit}
                disabled={
                  !bulkInput.trim() ||
                  createStudents.isPending
                }
              >
                {createStudents.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create accounts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function ClassCard({
  classId,
  className,
  schoolName,
  schoolId,
  allMastery,
  allIntegrity,
  onAddStudents,
  onDownloadCredentials,
}: {
  classId: string;
  className: string;
  schoolName?: string;
  schoolId: string;
  allMastery: Array<{ student_id: string; mastery_score: number }>;
  allIntegrity: Array<{ student_id: string; score: number }>;
  onAddStudents: () => void;
  onDownloadCredentials?: () => void;
}) {
  const { data: students = [], isLoading } = useStudentsInClass(classId);
  const studentIds = useMemo(() => students.map((s) => s.user_id), [students]);
  const classMastery = useMemo(
    () => allMastery.filter((m) => studentIds.includes(m.student_id)),
    [allMastery, studentIds]
  );
  const avgMastery =
    classMastery.length > 0
      ? Math.round(
          classMastery.reduce((s, m) => s + m.mastery_score, 0) / classMastery.length
        )
      : null;
  const classIntegrity = useMemo(
    () => allIntegrity.filter((i) => studentIds.includes(i.student_id)),
    [allIntegrity, studentIds]
  );
  const avgIntegrity =
    classIntegrity.length > 0
      ? Math.round(classIntegrity.reduce((s, i) => s + i.score, 0) / classIntegrity.length)
      : null;
  const atRisk = classIntegrity.filter((i) => i.score < 60).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{className}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <School className="w-3.5 h-3.5" />
              {schoolName || "—"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{students.length} students</span>
              </div>
              {avgMastery != null && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>Avg mastery {avgMastery}%</span>
                </div>
              )}
              {avgIntegrity != null && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Avg integrity {avgIntegrity}%</span>
                </div>
              )}
              {atRisk > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{atRisk} at risk</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onAddStudents}>
                <UserPlus className="w-4 h-4 mr-1" />
                Add students
              </Button>
              {onDownloadCredentials && (
                <Button size="sm" variant="outline" onClick={onDownloadCredentials}>
                  <Download className="w-4 h-4 mr-1" />
                  Download credentials (CSV)
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
