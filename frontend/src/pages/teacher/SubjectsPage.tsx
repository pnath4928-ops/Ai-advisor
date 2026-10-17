import { useState } from 'react';
import { useTeacher } from '@/hooks/useTeacher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import type { SubjectTopic } from '@/types';

export const SubjectsPage = () => {
  const { useSubjectTopics, useAcademicRecords, addSubjectTopic, updateSubjectTopic, deleteSubjectTopic } = useTeacher();
  const { data: topics, isLoading, isError } = useSubjectTopics();
  const { data: records } = useAcademicRecords();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectTopic | null>(null);
  const [deleting, setDeleting] = useState<SubjectTopic | null>(null);

  const emptyForm = { academicRecordId: '', topicName: '', rating: 'average' as SubjectTopic['rating'], remarks: '' };
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSubjectTopic.mutateAsync(addForm);
    setIsAddOpen(false);
    setAddForm(emptyForm);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateSubjectTopic.mutateAsync({ id: editing._id, data: editForm });
    setIsEditOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteSubjectTopic.mutateAsync(deleting._id);
    setIsDeleteOpen(false);
    setDeleting(null);
  };

  const openEdit = (topic: SubjectTopic) => {
    setEditing(topic);
    const recordId =
      typeof topic.academicRecordId === 'string'
        ? topic.academicRecordId
        : topic.academicRecordId._id;
    setEditForm({ academicRecordId: recordId, topicName: topic.topicName, rating: topic.rating, remarks: topic.remarks });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subject Topics</h1>
          <p className="text-sm text-text-secondary mt-1">Curriculum management</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
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
            <QueryErrorState queryKey={['teacher', 'subjects']} message="We couldn't load subject topics." />
          </CardContent>
        </Card>
      ) : topics && topics.length > 0 ? (
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {topics.map((topic) => (
            <StaggerItem key={topic._id} className="h-full">
              <Card className="group h-full hover:glow-purple transition-[box-shadow,border-color] duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-text-primary">{topic.topicName}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary mb-3">{topic.remarks || 'No remarks'}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      topic.rating === 'excellent' ? 'success' :
                      topic.rating === 'good' ? 'secondary' :
                      topic.rating === 'needs_improvement' ? 'danger' : 'warning'
                    }>
                      {topic.rating}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(topic)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setDeleting(topic); setIsDeleteOpen(true); }}>
                        <Trash2 className="w-3 h-3 text-danger" />
                      </Button>
                    </div>
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
              icon={<BookOpen className="w-6 h-6 text-text-tertiary" />}
              title="No topics found"
              description="Add your first topic to get started"
            />
          </CardContent>
        </Card>
      )}

      {/* Add Topic Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsAddOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Subject Topic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Academic Record</Label>
              <select
                value={addForm.academicRecordId}
                onChange={(e) => setAddForm({ ...addForm, academicRecordId: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                required
              >
                <option value="">Select record</option>
                {(records as { _id: string; subjectName: string }[] | undefined)?.map((r) => (
                  <option key={r._id} value={r._id}>{r.subjectName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input value={addForm.topicName} onChange={(e) => setAddForm({ ...addForm, topicName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <select
                value={addForm.rating}
                onChange={(e) => setAddForm({ ...addForm, rating: e.target.value as SubjectTopic['rating'] })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs_improvement">Needs Improvement</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <textarea
                value={addForm.remarks}
                onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addSubjectTopic.isPending}>
                {addSubjectTopic.isPending ? 'Adding...' : 'Add Topic'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsEditOpen(false)} />
          <DialogHeader>
            <DialogTitle>Edit Subject Topic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input value={editForm.topicName} onChange={(e) => setEditForm({ ...editForm, topicName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <select
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: e.target.value as SubjectTopic['rating'] })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs_improvement">Needs Improvement</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <textarea
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateSubjectTopic.isPending}>
                {updateSubjectTopic.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDeleteOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Topic</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <span className="font-semibold text-text-primary">{deleting?.topicName}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteSubjectTopic.isPending}>
              {deleteSubjectTopic.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
