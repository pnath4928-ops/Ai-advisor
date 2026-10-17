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
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { CalendarCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import type { StudyPlan } from '@/types';

export const StudyPlansPage = () => {
  const { useStudyPlans, createStudyPlan, updateStudyPlan, deleteStudyPlan } = useStudent();
  const { data: plans, isLoading, isError } = useStudyPlans();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<StudyPlan | null>(null);
  const [deleting, setDeleting] = useState<StudyPlan | null>(null);

  const [addForm, setAddForm] = useState({ weekStartDate: '', status: 'active' as StudyPlan['status'] });
  const [editForm, setEditForm] = useState({ weekStartDate: '', status: 'active' as StudyPlan['status'] });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudyPlan.mutateAsync(addForm);
      setIsAddOpen(false);
      setAddForm({ weekStartDate: '', status: 'active' });
    } catch {
      // error toast handled in hook
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateStudyPlan.mutateAsync({ id: editing._id, data: editForm });
      setIsEditOpen(false);
      setEditing(null);
    } catch {
      // error toast handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteStudyPlan.mutateAsync(deleting._id);
      setIsDeleteOpen(false);
      setDeleting(null);
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Study Plans</h1>
          <p className="text-sm text-text-secondary mt-1">Weekly study schedules</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
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
            <QueryErrorState queryKey={['student', 'study-plans']} message="We couldn't load your study plans." />
          </CardContent>
        </Card>
      ) : plans && plans.length > 0 ? (
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {plans.map((plan) => (
            <StaggerItem key={plan._id} className="h-full">
              <Card className="group h-full hover:glow-purple transition-[box-shadow,border-color] duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <CalendarCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Week of {new Date(plan.weekStartDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={plan.status === 'active' ? 'success' : plan.status === 'completed' ? 'secondary' : 'warning'}>
                    {plan.status}
                  </Badge>
                  <div className="flex gap-1 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(plan); setEditForm({ weekStartDate: plan.weekStartDate.split('T')[0], status: plan.status }); setIsEditOpen(true); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDeleting(plan); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-3 h-3 text-danger" />
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
              icon={<CalendarCheck className="w-6 h-6 text-text-tertiary" />}
              title="No study plans found"
            />
          </CardContent>
        </Card>
      )}

      {/* Add Plan Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsAddOpen(false)} />
          <DialogHeader><DialogTitle>Create Study Plan</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Week Start Date</Label>
              <Input type="date" value={addForm.weekStartDate} onChange={(e) => setAddForm({ ...addForm, weekStartDate: e.target.value })} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createStudyPlan.isPending}>{createStudyPlan.isPending ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsEditOpen(false)} />
          <DialogHeader><DialogTitle>Edit Study Plan</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Week Start Date</Label>
              <Input type="date" value={editForm.weekStartDate} onChange={(e) => setEditForm({ ...editForm, weekStartDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as StudyPlan['status'] })} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateStudyPlan.isPending}>{updateStudyPlan.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDeleteOpen(false)} />
          <DialogHeader><DialogTitle>Delete Study Plan</DialogTitle></DialogHeader>
          <p className="text-sm text-text-secondary">Delete this study plan? This will also remove all associated tasks.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteStudyPlan.isPending}>{deleteStudyPlan.isPending ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
