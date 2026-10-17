import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTeacher } from '@/hooks/useTeacher';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { BarChart3, Plus, Pencil } from 'lucide-react';
import type { AcademicRecord } from '@/types';

export const AcademicRecordsPage = () => {
  const { useAcademicRecords, useStudents, addAcademicRecord, updateAcademicRecord } = useTeacher();
  const { data: records, isLoading, isError } = useAcademicRecords();
  const { data: students } = useStudents();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicRecord | null>(null);

  const emptyForm = {
    studentId: '',
    subjectName: '',
    term: '',
    totalClasses: 0,
    attendedClasses: 0,
    score: 0,
    grade: '',
    teacherNotes: '',
  };

  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAcademicRecord.mutateAsync(addForm);
    setIsAddOpen(false);
    setAddForm(emptyForm);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateAcademicRecord.mutateAsync({ id: editing._id, data: editForm });
    setIsEditOpen(false);
    setEditing(null);
  };

  const openEdit = (record: AcademicRecord) => {
    setEditing(record);
    setEditForm({
      studentId: typeof record.studentId === 'string' ? record.studentId : (record.studentId as unknown as { _id: string })._id,
      subjectName: record.subjectName,
      term: record.term,
      totalClasses: record.totalClasses,
      attendedClasses: record.attendedClasses,
      score: record.score,
      grade: record.grade,
      teacherNotes: record.teacherNotes,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Academic Records</h1>
          <p className="text-sm text-text-secondary mt-1">Student performance data</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Student</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Subject</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Grade</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Score</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Attendance</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Term</th>
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
                  <QueryErrorState queryKey={['teacher', 'academicRecords']} colSpan={7} message="We couldn't load academic records." />
                ) : records && records.length > 0 ? (
                  records.map((record) => (
                    <motion.tr
                      key={record._id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-secondary/50 transition-colors"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
                    >
                      <td className="p-4 text-sm font-medium text-text-primary">{(record.studentId as unknown as { studentId?: string })?.studentId || 'Unknown'}</td>
                      <td className="p-4"><Badge variant="secondary">{record.subjectName}</Badge></td>
                      <td className="p-4 text-sm font-semibold text-text-primary">{record.grade}</td>
                      <td className="p-4 text-sm text-text-secondary">{record.score}%</td>
                      <td className="p-4 text-sm text-text-secondary">{record.attendedClasses}/{record.totalClasses}</td>
                      <td className="p-4 text-xs text-text-secondary uppercase tracking-wider">{record.term}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <EmptyState
                        icon={<BarChart3 className="w-6 h-6 text-text-tertiary" />}
                        title="No records found"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Record Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsAddOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Academic Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <select
                value={addForm.studentId}
                onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                required
              >
                <option value="">Select student</option>
                {(students as { _id: string; studentId: string; userId?: { name?: string } }[] | undefined)?.map((s) => (
                  <option key={s._id} value={s._id}>{s.userId?.name || s.studentId}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input value={addForm.subjectName} onChange={(e) => setAddForm({ ...addForm, subjectName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade</Label>
                <select
                  value={addForm.grade}
                  onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                  required
                >
                  <option value="">Select</option>
                  {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Score (0-100)</Label>
                <Input type="number" min={0} max={100} value={addForm.score} onChange={(e) => setAddForm({ ...addForm, score: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Classes</Label>
                <Input type="number" min={0} value={addForm.totalClasses} onChange={(e) => setAddForm({ ...addForm, totalClasses: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Attended Classes</Label>
                <Input type="number" min={0} value={addForm.attendedClasses} onChange={(e) => setAddForm({ ...addForm, attendedClasses: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <select
                value={addForm.term}
                onChange={(e) => setAddForm({ ...addForm, term: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                required
              >
                <option value="">Select</option>
                {['Term 1', 'Term 2', 'Term 3'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Teacher Notes</Label>
              <textarea
                value={addForm.teacherNotes}
                onChange={(e) => setAddForm({ ...addForm, teacherNotes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addAcademicRecord.isPending}>
                {addAcademicRecord.isPending ? 'Adding...' : 'Add Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Record Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsEditOpen(false)} />
          <DialogHeader>
            <DialogTitle>Edit Academic Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input value={editForm.subjectName} onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade</Label>
                <select
                  value={editForm.grade}
                  onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                  required
                >
                  <option value="">Select</option>
                  {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Score (0-100)</Label>
                <Input type="number" min={0} max={100} value={editForm.score} onChange={(e) => setEditForm({ ...editForm, score: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Classes</Label>
                <Input type="number" min={0} value={editForm.totalClasses} onChange={(e) => setEditForm({ ...editForm, totalClasses: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Attended Classes</Label>
                <Input type="number" min={0} value={editForm.attendedClasses} onChange={(e) => setEditForm({ ...editForm, attendedClasses: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <select
                value={editForm.term}
                onChange={(e) => setEditForm({ ...editForm, term: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                required
              >
                <option value="">Select</option>
                {['Term 1', 'Term 2', 'Term 3'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Teacher Notes</Label>
              <textarea
                value={editForm.teacherNotes}
                onChange={(e) => setEditForm({ ...editForm, teacherNotes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateAcademicRecord.isPending}>
                {updateAcademicRecord.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
