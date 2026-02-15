import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useConcepts, useSubjects } from '@/hooks/useConcepts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Loader2, Pencil, Clock } from 'lucide-react';

export default function AdminSubjects() {
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { data: concepts = [], isLoading: loadingConcepts } = useConcepts();
  const isLoading = loadingSubjects || loadingConcepts;
  const qc = useQueryClient();
  const { toast } = useToast();

  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showConceptDialog, setShowConceptDialog] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', icon_name: 'BookOpen', color: 'primary' });
  const [conceptForm, setConceptForm] = useState({
    subject_id: '', name: '', description: '', estimated_minutes: '15', sort_order: '1', prerequisite_ids: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const handleSaveSubject = async () => {
    if (!subjectForm.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('subjects').insert({
      name: subjectForm.name,
      description: subjectForm.description,
      icon_name: subjectForm.icon_name,
      color: subjectForm.color,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Subject created' });
    qc.invalidateQueries({ queryKey: ['concepts'] });
    setShowSubjectDialog(false);
    setSubjectForm({ name: '', description: '', icon_name: 'BookOpen', color: 'primary' });
  };

  const handleSaveConcept = async () => {
    if (!conceptForm.name.trim() || !conceptForm.subject_id) return;
    setSaving(true);
    const { error } = await supabase.from('concepts').insert({
      subject_id: conceptForm.subject_id,
      name: conceptForm.name,
      description: conceptForm.description,
      estimated_minutes: parseInt(conceptForm.estimated_minutes) || 15,
      sort_order: parseInt(conceptForm.sort_order) || 1,
      prerequisite_ids: conceptForm.prerequisite_ids.length > 0 ? conceptForm.prerequisite_ids : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Concept created' });
    qc.invalidateQueries({ queryKey: ['concepts'] });
    setShowConceptDialog(false);
    setConceptForm({ subject_id: '', name: '', description: '', estimated_minutes: '15', sort_order: '1', prerequisite_ids: [] });
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subjects & Concepts</h1>
            <p className="text-muted-foreground mt-1">Define global subjects and concept hierarchies</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showConceptDialog} onOpenChange={setShowConceptDialog}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="w-4 h-4 mr-2" />Add Concept</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Concept</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={conceptForm.subject_id} onValueChange={(v) => setConceptForm({ ...conceptForm, subject_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Concept Name *</Label>
                    <Input value={conceptForm.name} onChange={(e) => setConceptForm({ ...conceptForm, name: e.target.value })} placeholder="e.g. Variables & Data Types" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={conceptForm.description} onChange={(e) => setConceptForm({ ...conceptForm, description: e.target.value })} placeholder="Brief description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Minutes</Label>
                      <Input type="number" value={conceptForm.estimated_minutes} onChange={(e) => setConceptForm({ ...conceptForm, estimated_minutes: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sort Order</Label>
                      <Input type="number" value={conceptForm.sort_order} onChange={(e) => setConceptForm({ ...conceptForm, sort_order: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Prerequisites (optional)</Label>
                    <Select
                      value=""
                      onValueChange={(v) => {
                        if (v && !conceptForm.prerequisite_ids.includes(v)) {
                          setConceptForm({ ...conceptForm, prerequisite_ids: [...conceptForm.prerequisite_ids, v] });
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Add prerequisite concept" /></SelectTrigger>
                      <SelectContent>
                        {concepts
                          .filter((c) => c.subject_id === conceptForm.subject_id && c.id !== conceptForm.subject_id)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {conceptForm.prerequisite_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {conceptForm.prerequisite_ids.map((id) => {
                          const pr = concepts.find((c) => c.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setConceptForm({ ...conceptForm, prerequisite_ids: conceptForm.prerequisite_ids.filter((x) => x !== id) })}>
                              {pr?.name || id} ×
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveConcept} disabled={saving || !conceptForm.name || !conceptForm.subject_id}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Concept
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Subject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Subject Name *</Label>
                    <Input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="e.g. Mathematics" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} placeholder="Subject description..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveSubject} disabled={saving || !subjectForm.name}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Create Subject
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Subjects ({subjects.length}) &amp; Concepts ({concepts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
            ) : !subjects.length ? (
              <p className="text-muted-foreground text-center py-8">No subjects yet. Create your first subject to start defining concepts.</p>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {subjects.map((subject) => {
                  const subjectConcepts = concepts.filter(c => c.subject_id === subject.id);
                  return (
                    <AccordionItem key={subject.id} value={subject.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <span className="font-semibold">{subject.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({subjectConcepts.length} concepts)</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>
                        {subjectConcepts.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">No concepts defined yet.</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Concept</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Duration</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subjectConcepts.sort((a, b) => a.sort_order - b.sort_order).map((concept) => (
                                <TableRow key={concept.id}>
                                  <TableCell className="text-muted-foreground">{concept.sort_order}</TableCell>
                                  <TableCell className="font-medium">{concept.name}</TableCell>
                                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{concept.description}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {concept.estimated_minutes}m
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
