import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTeacher } from '@/hooks/useTeacher';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { fadeUp } from '@/lib/motion';
import { ClipboardList, Pencil, CheckSquare, Square, Eye } from 'lucide-react';
import type { Student, Assignment } from '@/types';
import { populatedName } from '@/lib/utils';

export const AssignmentsPage = () => {
  const { useAssignments, useStudents, createBulkAssignments, updateAssignment, addAcademicRecord } = useTeacher();
  const { data: assignments, isLoading, isError } = useAssignments();
  const { data: students } = useStudents();

  const [tab, setTab] = useState<'all' | 'submitted'>('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [recordTarget, setRecordTarget] = useState<Assignment | null>(null);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const [targetType, setTargetType] = useState<'individual' | 'class'>('individual');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    subjectName: '',
    dueDate: '',
    marks: 100,
  });

  const [editForm, setEditForm] = useState({ title: '', dueDate: '', marks: 100 });

  const [recordForm, setRecordForm] = useState({
    term: '',
    totalClasses: 0,
    attendedClasses: 0,
    score: 0,
    grade: '',
    teacherNotes: '',
  });

  const classes = useMemo(() => {
    if (!students) return [];
    return [...new Set(students.map((s: Student) => s.gradeLevel).filter(Boolean))] as string[];
  }, [students]);

  const studentsInSelectedClass = useMemo(() => {
    if (!students || !selectedClass) return [];
    return students.filter((s: Student) => s.gradeLevel === selectedClass);
  }, [students, selectedClass]);

  const filtered = useMemo(() => {
    if (!assignments) return [];
    return tab === 'submitted'
      ? assignments.filter((a) => a.submitted)
      : assignments;
  }, [assignments, tab]);

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let studentIds: string[] = [];
    if (targetType === 'individual') {
      studentIds = selectedStudents;
    } else {
      studentIds = studentsInSelectedClass.map((s: Student) => s._id);
    }
    if (studentIds.length === 0) return;

    await createBulkAssignments.mutateAsync({
      title: createForm.title,
      description: createForm.description,
      subjectName: createForm.subjectName,
      dueDate: createForm.dueDate,
      marks: createForm.marks,
      studentIds,
    });

    setIsCreateOpen(false);
    setCreateForm({ title: '', description: '', subjectName: '', dueDate: '', marks: 100 });
    setSelectedStudents([]);
    setSelectedClass('');
    setTargetType('individual');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateAssignment.mutateAsync({ id: editing._id, data: editForm });
    setIsEditOpen(false);
    setEditing(null);
  };

  const openEdit = (assignment: Assignment) => {
    setEditing(assignment);
    setEditForm({
      title: assignment.title,
      dueDate: assignment.dueDate.split('T')[0],
      marks: assignment.marks,
    });
    setIsEditOpen(true);
  };

  const openRecord = (assignment: Assignment) => {
    setRecordTarget(assignment);
    setRecordForm({ term: '', totalClasses: 0, attendedClasses: 0, score: 0, grade: '', teacherNotes: '' });
    setIsRecordOpen(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTarget) return;
    await addAcademicRecord.mutateAsync({
      studentId: typeof recordTarget.studentId === 'string'
        ? recordTarget.studentId
        : (recordTarget.studentId as unknown as { _id: string })._id,
      subjectName: recordTarget.subjectName,
      term: recordForm.term,
      totalClasses: recordForm.totalClasses,
      attendedClasses: recordForm.attendedClasses,
      score: recordForm.score,
      grade: recordForm.grade,
      teacherNotes: recordForm.teacherNotes,
    });
    setIsRecordOpen(false);
    setRecordTarget(null);
  };

  const getStudentName = (studentId: string | { _id: string; studentId: string; gradeLevel: string } | undefined): string => {
    if (!studentId) return 'Unknown';
    if (typeof studentId === 'string') return studentId;
    return `${studentId.studentId} (${studentId.gradeLevel})`;
  };

  const submissionCount = useMemo(() => {
    if (!assignments) return 0;
    return assignments.filter((a) => a.submitted).length;
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assignments</h1>
          <p className="text-sm text-text-secondary mt-1">Manage student assignments</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <ClipboardList className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'submitted')}>
        <TabsList>
          <TabsTrigger value="all">All ({assignments?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submissionCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Title</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Subject</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Assigned To</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Due Date</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Marks</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-tertiary">
                        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <QueryErrorState queryKey={['teacher', 'assignments']} colSpan={7} message="We couldn't load assignments." />
                ) : filtered.length > 0 ? (
                  filtered.map((assignment) => (
                    <motion.tr
                      key={assignment._id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-secondary/50 transition-colors"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
                    >
                      <td className="p-4 text-sm font-medium text-text-primary">{assignment.title}</td>
                      <td className="p-4 text-xs text-text-secondary">{assignment.subjectName}</td>
                      <td className="p-4 text-xs text-text-secondary">{getStudentName(assignment.studentId)}</td>
                      <td className="p-4 text-xs text-text-secondary">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-text-secondary">{assignment.marks}</td>
                      <td className="p-4">
                        <Badge variant={assignment.submitted ? 'success' : 'secondary'}>
                          {assignment.submitted ? 'Submitted' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {!assignment.submitted ? (
                            <Button variant="ghost" size="sm" onClick={() => openEdit(assignment)}>
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => openRecord(assignment)} className="text-primary">
                              <Eye className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <EmptyState
                        icon={<ClipboardList className="w-6 h-6 text-text-tertiary" />}
                        title={tab === 'submitted' ? 'No submitted assignments yet' : 'No assignments found'}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Assignment Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogClose onClick={() => { setIsCreateOpen(false); setSelectedStudents([]); setSelectedClass(''); setTargetType('individual'); }} />
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Assignment Topic</Label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="flex min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={createForm.subjectName} onChange={(e) => setCreateForm({ ...createForm, subjectName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Marks</Label>
              <Input type="number" min={0} value={createForm.marks} onChange={(e) => setCreateForm({ ...createForm, marks: Number(e.target.value) })} required />
            </div>

            <div className="space-y-3">
              <Label>Grade</Label>
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudents([]); }} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" required>
                <option value="">Select grade</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {selectedClass && (
                <>
                  <div className="flex gap-2">
                    <Button type="button" variant={targetType === 'individual' ? 'default' : 'outline'} size="sm" onClick={() => setTargetType('individual')}>
                      Individual Students
                    </Button>
                    <Button type="button" variant={targetType === 'class' ? 'default' : 'outline'} size="sm" onClick={() => setTargetType('class')}>
                      Whole Class
                    </Button>
                  </div>

                  {targetType === 'individual' ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-border p-3">
                      {studentsInSelectedClass.length > 0 ? (
                        studentsInSelectedClass.map((s: Student) => {
                          const studentId = s._id;
                          const name = populatedName(s.userId, s.studentId);
                          const isSelected = selectedStudents.includes(studentId);
                          return (
                            <button key={studentId} type="button" onClick={() => toggleStudent(studentId)} className="flex items-center gap-2 w-full text-left p-1.5 rounded-lg hover:bg-surface-secondary transition-colors">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-text-tertiary" />}
                              <span className="text-sm text-text-primary">{name}</span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-sm text-text-tertiary text-center py-4">No students in this grade</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      Assignment will be sent to all <strong>{studentsInSelectedClass.length}</strong> students in <strong>{selectedClass}</strong>
                    </p>
                  )}

                  {targetType === 'individual' && selectedStudents.length > 0 && (
                    <p className="text-xs text-text-tertiary">
                      <strong>{selectedStudents.length}</strong> student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setSelectedStudents([]); setSelectedClass(''); setTargetType('individual'); }}>Cancel</Button>
              <Button type="submit" disabled={createBulkAssignments.isPending || !selectedClass || (targetType === 'individual' && selectedStudents.length === 0)}>
                {createBulkAssignments.isPending ? 'Creating...' : 'Create Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => { setIsEditOpen(false); setEditing(null); }} />
          <DialogHeader><DialogTitle>Edit Assignment</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input type="number" min={0} value={editForm.marks} onChange={(e) => setEditForm({ ...editForm, marks: Number(e.target.value) })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={updateAssignment.isPending}>
                {updateAssignment.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Submission / Create Record Modal */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent>
          <DialogClose onClick={() => { setIsRecordOpen(false); setRecordTarget(null); }} />
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          {recordTarget && (
            <form onSubmit={handleRecordSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-surface-secondary text-sm">
                <p className="font-medium text-text-primary">{recordTarget.title}</p>
                <p className="text-text-secondary text-xs mt-0.5">{recordTarget.subjectName} &middot; {getStudentName(recordTarget.studentId)}</p>
              </div>

              {/* Student's Answer */}
              <div className="space-y-2">
                <Label>Student's Answer</Label>
                <div className="p-3 rounded-xl bg-surface-secondary text-sm text-text-primary whitespace-pre-wrap min-h-24 max-h-60 overflow-y-auto">
                  {recordTarget.studentAnswer || 'No answer submitted'}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-text-primary mb-3">Create Academic Record</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Term</Label>
                    <Input value={recordForm.term} onChange={(e) => setRecordForm({ ...recordForm, term: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input value={recordForm.grade} onChange={(e) => setRecordForm({ ...recordForm, grade: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Score</Label>
                    <Input type="number" min={0} max={recordTarget.marks > 0 ? recordTarget.marks : undefined} value={recordForm.score} onChange={(e) => setRecordForm({ ...recordForm, score: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Classes</Label>
                    <Input type="number" min={0} value={recordForm.totalClasses} onChange={(e) => setRecordForm({ ...recordForm, totalClasses: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Attended Classes</Label>
                    <Input type="number" min={0} value={recordForm.attendedClasses} onChange={(e) => setRecordForm({ ...recordForm, attendedClasses: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Notes</Label>
                  <textarea
                    value={recordForm.teacherNotes}
                    onChange={(e) => setRecordForm({ ...recordForm, teacherNotes: e.target.value })}
                    className="flex min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsRecordOpen(false); setRecordTarget(null); }}>Cancel</Button>
                <Button type="submit" disabled={addAcademicRecord.isPending}>
                  {addAcademicRecord.isPending ? 'Creating...' : 'Create Record'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
