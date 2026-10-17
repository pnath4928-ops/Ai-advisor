import { useState, useMemo } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import { studyTopicApi } from '@/api/studyTopic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ListTodo, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { StudyTask } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const { useTasks, useStudyPlans, deleteTask } = useStudent();
  const { data: tasks, isLoading, isError } = useTasks();
  const { data: plans } = useStudyPlans();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<StudyTask | null>(null);

  const [addForm, setAddForm] = useState({
    studyPlanId: '',
    day: '',
    subjectName: '',
    studyTechnique: '',
    topics: [{ topicName: '', plannedMinutes: 60 }],
  });

  const totalMinutes = useMemo(
    () => addForm.topics.reduce((sum, t) => sum + (t.plannedMinutes || 0), 0),
    [addForm.topics]
  );

  const addTopic = () => {
    setAddForm((prev) => ({
      ...prev,
      topics: [...prev.topics, { topicName: '', plannedMinutes: 60 }],
    }));
  };

  const removeTopic = (index: number) => {
    setAddForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const updateTopic = (index: number, field: 'topicName' | 'plannedMinutes', value: string | number) => {
    setAddForm((prev) => {
      const topics = [...prev.topics];
      topics[index] = { ...topics[index], [field]: value };
      return { ...prev, topics };
    });
  };

  const selectedPlan = useMemo(
    () => (plans || []).find((p) => p._id === addForm.studyPlanId),
    [plans, addForm.studyPlanId]
  );

  const availableDays = useMemo(() => {
    if (!selectedPlan) return DAYS;
    const weekStart = new Date(selectedPlan.weekStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return DAYS.filter((_, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      return dayDate >= today;
    });
  }, [selectedPlan]);

  const groupedTasks = useMemo(() => {
    const map = new Map<string, StudyTask[]>();
    for (const t of tasks || []) {
      if (!map.has(t.day)) map.set(t.day, []);
      map.get(t.day)!.push(t);
    }
    return DAYS
      .filter((day) => map.has(day))
      .map((day) => ({ day, items: map.get(day) || [] }));
  }, [tasks]);

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const task = await studentApi.createTask({
        studyPlanId: addForm.studyPlanId,
        day: addForm.day,
        subjectName: addForm.subjectName,
        plannedMinutes: totalMinutes,
        studyTechnique: addForm.studyTechnique,
      });
      await studyTopicApi.createTopics(
        task._id,
        addForm.topics.map((t) => ({ topicName: t.topicName, plannedMinutes: t.plannedMinutes }))
      );
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'topics'] });
      setIsAddOpen(false);
      setAddForm({ studyPlanId: '', day: '', subjectName: '', studyTechnique: '', topics: [{ topicName: '', plannedMinutes: 60 }] });
    },
  });

  const [editForm, setEditForm] = useState({
    day: '',
    subjectName: '',
    studyTechnique: '',
    topics: [{ topicName: '', plannedMinutes: 60 }] as Array<{ _id?: string; topicName: string; plannedMinutes: number }>,
  });

  const editTotalMinutes = useMemo(
    () => editForm.topics.reduce((sum, t) => sum + (t.plannedMinutes || 0), 0),
    [editForm.topics]
  );

  const addEditTopic = () => {
    setEditForm((prev) => ({
      ...prev,
      topics: [...prev.topics, { topicName: '', plannedMinutes: 60 }],
    }));
  };

  const removeEditTopic = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const updateEditTopic = (index: number, field: 'topicName' | 'plannedMinutes', value: string | number) => {
    setEditForm((prev) => {
      const topics = [...prev.topics];
      topics[index] = { ...topics[index], [field]: value };
      return { ...prev, topics };
    });
  };

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const updated = await studentApi.updateTask(editing._id, {
        day: editForm.day,
        subjectName: editForm.subjectName,
        plannedMinutes: editTotalMinutes,
        studyTechnique: editForm.studyTechnique,
      });
      const existingTopics = await studyTopicApi.getTopicsByTask(editing._id);
      const incomingIds = new Set(editForm.topics.map((t) => t._id).filter(Boolean));

      for (const existing of existingTopics) {
        if (!incomingIds.has(existing._id)) {
          await studyTopicApi.deleteTopic(existing._id);
        }
      }
      for (const topic of editForm.topics) {
        if (topic._id) {
          const current = existingTopics.find((t) => t._id === topic._id);
          if (current && (current.topicName !== topic.topicName || current.plannedMinutes !== topic.plannedMinutes)) {
            await studyTopicApi.updateTopic(topic._id, {
              topicName: topic.topicName,
              plannedMinutes: topic.plannedMinutes,
            });
          }
        } else {
          await studyTopicApi.createTopics(editing._id, [
            { topicName: topic.topicName, plannedMinutes: topic.plannedMinutes },
          ]);
        }
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'topics'] });
      setIsEditOpen(false);
      setEditing(null);
    },
  });

  const openEdit = async (task: StudyTask) => {
    setEditing(task);
    try {
      const existingTopics = await studyTopicApi.getTopicsByTask(task._id);
      setEditForm({
        day: task.day,
        subjectName: task.subjectName,
        studyTechnique: task.studyTechnique,
        topics: existingTopics.length > 0
          ? existingTopics.map((t) => ({ _id: t._id, topicName: t.topicName, plannedMinutes: t.plannedMinutes }))
          : [{ topicName: '', plannedMinutes: task.plannedMinutes }],
      });
      setIsEditOpen(true);
    } catch {
      // keep dialog closed if topics can't be loaded
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-sm text-text-secondary mt-1">Study tasks for your plans</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
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
            <QueryErrorState queryKey={['student', 'tasks']} message="We couldn't load your tasks." />
          </CardContent>
        </Card>
      ) : tasks && tasks.length > 0 ? (
        <StaggerContainer className="space-y-6" stagger={0.06}>
          {groupedTasks.map((group) => (
            <div key={group.day} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  {group.day}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  {group.items.length} task{group.items.length > 1 ? 's' : ''} ·{" "}
                  {group.items.reduce((sum, t) => sum + t.plannedMinutes, 0)}min
                </span>
              </div>
              {group.items.map((task) => (
                <StaggerItem key={task._id} className={task.status === 'completed' ? 'opacity-60' : ''}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.status === 'completed' ? 'bg-success border-success text-white' : 'border-border'
                          }`}>
                            {task.status === 'completed' && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>{task.subjectName}</p>
                            <p className="text-xs text-text-tertiary">{task.day} · {task.plannedMinutes}min · {task.studyTechnique}</p>
                          </div>
                        </div>
                        {task.status !== 'completed' && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(task)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Delete this task?')) {
                                  deleteTask.mutate(task._id);
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-danger" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          ))}
        </StaggerContainer>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <EmptyState
              icon={<ListTodo className="w-6 h-6 text-text-tertiary" />}
              title="No tasks found"
            />
          </CardContent>
        </Card>
      )}

      {/* Add Task Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsAddOpen(false)} />
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Study Plan</Label>
              <select value={addForm.studyPlanId} onChange={(e) => setAddForm({ ...addForm, studyPlanId: e.target.value, day: '' })} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" required>
                <option value="">Select plan</option>
                {(plans || []).map((p) => (
                  <option key={p._id} value={p._id}>Week of {new Date(p.weekStartDate).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day</Label>
                <select value={addForm.day} onChange={(e) => setAddForm({ ...addForm, day: e.target.value })} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" required>
                  <option value="">Select day</option>
                  {availableDays.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Subject Name</Label>
                <Input value={addForm.subjectName} onChange={(e) => setAddForm({ ...addForm, subjectName: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Study Technique</Label>
              <Input value={addForm.studyTechnique} onChange={(e) => setAddForm({ ...addForm, studyTechnique: e.target.value })} required />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Topics</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addTopic}>
                  <Plus className="w-3 h-3 mr-1" /> Add Topic
                </Button>
              </div>
              {addForm.topics.map((topic, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Topic Name</Label>
                    <Input value={topic.topicName} onChange={(e) => updateTopic(i, 'topicName', e.target.value)} required />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Minutes</Label>
                    <Input type="number" min={1} value={topic.plannedMinutes} onChange={(e) => updateTopic(i, 'plannedMinutes', Number(e.target.value))} required />
                  </div>
                  {addForm.topics.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTopic(i)} className="mb-0.5">
                      <X className="w-3 h-3 text-danger" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-text-tertiary text-right">
                Total: <strong>{totalMinutes}</strong> minutes
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => { setIsEditOpen(false); setEditing(null); }} />
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateTaskMutation.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day</Label>
                <select value={editForm.day} onChange={(e) => setEditForm({ ...editForm, day: e.target.value })} className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" required>
                  <option value="">Select day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Subject Name</Label>
                <Input value={editForm.subjectName} onChange={(e) => setEditForm({ ...editForm, subjectName: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Study Technique</Label>
              <Input value={editForm.studyTechnique} onChange={(e) => setEditForm({ ...editForm, studyTechnique: e.target.value })} required />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Topics</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addEditTopic}>
                  <Plus className="w-3 h-3 mr-1" /> Add Topic
                </Button>
              </div>
              {editForm.topics.map((topic, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Topic Name</Label>
                    <Input value={topic.topicName} onChange={(e) => updateEditTopic(i, 'topicName', e.target.value)} required />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Minutes</Label>
                    <Input type="number" min={1} value={topic.plannedMinutes} onChange={(e) => updateEditTopic(i, 'plannedMinutes', Number(e.target.value))} required />
                  </div>
                  {editForm.topics.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEditTopic(i)} className="mb-0.5">
                      <X className="w-3 h-3 text-danger" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-text-tertiary text-right">
                Total: <strong>{editTotalMinutes}</strong> minutes
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={updateTaskMutation.isPending}>
                {updateTaskMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
