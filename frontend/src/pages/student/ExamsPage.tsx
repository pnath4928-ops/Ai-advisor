import { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';
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
import { GraduationCap, Plus, Pencil } from 'lucide-react';
import type { Exam } from '@/types';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';

export const ExamsPage = () => {
  const { useExams, addExam, updateExam } = useStudent();
  const { data: exams, isLoading, isError } = useExams();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);

  const emptyForm = { subjectName: '', examType: '', examDate: '', preparationLevel: 50 };
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExam.mutateAsync(addForm);
      setIsAddOpen(false);
      setAddForm(emptyForm);
    } catch {
      // error toast handled in hook
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateExam.mutateAsync({ id: editing._id, data: editForm });
      setIsEditOpen(false);
      setEditing(null);
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Exams</h1>
          <p className="text-sm text-text-secondary mt-1">Track your upcoming exams</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exam
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-text-tertiary">
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Loading...
          </div>
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-4">
            <QueryErrorState queryKey={['student', 'exams']} message="We couldn't load your exams." />
          </CardContent>
        </Card>
      ) : exams && exams.length > 0 ? (
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {exams.map((exam) => (
            <StaggerItem key={exam._id} className="h-full">
              <Card className="group hover:glow-purple transition-all duration-300 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-info-subtle">
                        <GraduationCap className="w-4 h-4 text-info" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{exam.subjectName}</p>
                        <p className="text-xs text-text-secondary">{exam.examType}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary mb-2">{new Date(exam.examDate).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={exam.preparationLevel >= 70 ? 'success' : exam.preparationLevel >= 40 ? 'warning' : 'danger'}>
                      Prep: {exam.preparationLevel}%
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(exam); setEditForm({ subjectName: exam.subjectName, examType: exam.examType, examDate: exam.examDate.split('T')[0], preparationLevel: exam.preparationLevel }); setIsEditOpen(true); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <EmptyState
              icon={<GraduationCap className="w-6 h-6 text-text-tertiary" />}
              title="No exams found"
            />
          </CardContent>
        </Card>
      )}

      {/* Add Exam Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsAddOpen(false)} />
          <DialogHeader><DialogTitle>Add Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input value={addForm.subjectName} onChange={(e) => setAddForm({ ...addForm, subjectName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Input value={addForm.examType} onChange={(e) => setAddForm({ ...addForm, examType: e.target.value })} placeholder="e.g., Midterm, Final, Quiz" required />
            </div>
            <div className="space-y-2">
              <Label>Exam Date</Label>
              <Input type="date" value={addForm.examDate} onChange={(e) => setAddForm({ ...addForm, examDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Preparation Level (0-100)</Label>
              <Input type="number" min={0} max={100} value={addForm.preparationLevel} onChange={(e) => setAddForm({ ...addForm, preparationLevel: Number(e.target.value) })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addExam.isPending}>{addExam.isPending ? 'Adding...' : 'Add Exam'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsEditOpen(false)} />
          <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input value={editForm.subjectName} onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Input value={editForm.examType} onChange={(e) => setEditForm({ ...editForm, examType: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Exam Date</Label>
              <Input type="date" value={editForm.examDate} onChange={(e) => setEditForm({ ...editForm, examDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Preparation Level (0-100)</Label>
              <Input type="number" min={0} max={100} value={editForm.preparationLevel} onChange={(e) => setEditForm({ ...editForm, preparationLevel: Number(e.target.value) })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateExam.isPending}>{updateExam.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
