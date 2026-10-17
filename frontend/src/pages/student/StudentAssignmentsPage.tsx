import { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ClipboardList, FileText, Calendar, Award, Send } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';

export const StudentAssignmentsPage = () => {
  const { useAssignments, submitAssignment } = useStudent();
  const { data: assignments, isLoading, isError } = useAssignments();

  const [isSolveOpen, setIsSolveOpen] = useState(false);
  const [solving, setSolving] = useState<{
    _id: string;
    title: string;
    description?: string;
    subjectName: string;
    dueDate: string;
    marks: number;
    submitted: boolean;
  } | null>(null);
  const [answer, setAnswer] = useState('');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewing, setViewing] = useState<{
    _id: string;
    title: string;
    description?: string;
    subjectName: string;
    dueDate: string;
    marks: number;
    submitted: boolean;
    studentAnswer?: string;
  } | null>(null);

  const openSolve = (a: typeof solving) => {
    setSolving(a);
    setAnswer('');
    setIsSolveOpen(true);
  };

  const openView = (a: typeof viewing) => {
    setViewing(a);
    setIsViewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solving) return;
    try {
      await submitAssignment.mutateAsync({ id: solving._id, studentAnswer: answer });
      setIsSolveOpen(false);
      setSolving(null);
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Assignments</h1>
        <p className="text-sm text-text-secondary mt-1">View and solve assignments assigned to you</p>
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
            <QueryErrorState queryKey={['student', 'assignments']} message="We couldn't load your assignments." />
          </CardContent>
        </Card>
      ) : assignments && assignments.length > 0 ? (
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {assignments.map((a) => (
            <StaggerItem key={a._id} className="h-full">
              <Card className="group transition-all duration-300 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${a.submitted ? 'bg-success-subtle' : 'bg-surface-secondary'}`}>
                      <ClipboardList className={`w-5 h-5 ${a.submitted ? 'text-success' : 'text-text-secondary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">{a.title}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{a.subjectName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {a.marks} marks
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={a.submitted ? 'success' : 'secondary'}>
                      {a.submitted ? 'Submitted' : 'Pending'}
                    </Badge>
                    {!a.submitted ? (
                      <Button size="sm" onClick={() => openSolve(a)}>
                        <Send className="w-3 h-3 mr-1" />
                        Solve
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => openView(a)}>
                        <FileText className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
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
              icon={<ClipboardList className="w-6 h-6 text-text-tertiary" />}
              title="No assignments yet"
            />
          </CardContent>
        </Card>
      )}

      {/* Solve Modal */}
      <Dialog open={isSolveOpen} onOpenChange={setIsSolveOpen}>
        <DialogContent>
          <DialogClose onClick={() => { setIsSolveOpen(false); setSolving(null); }} />
          <DialogHeader><DialogTitle>{solving?.title}</DialogTitle></DialogHeader>
          {solving && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {solving.description && (
                <div className="p-3 rounded-xl bg-surface-secondary text-sm text-text-primary">
                  {solving.description}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-tertiary">Subject</p>
                  <p className="text-text-primary font-medium">{solving.subjectName}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Marks</p>
                  <p className="text-text-primary font-medium">{solving.marks}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your Answer</Label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex min-h-40 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Write your answer here..."
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsSolveOpen(false); setSolving(null); }}>Cancel</Button>
                <Button type="submit" disabled={submitAssignment.isPending}>
                  {submitAssignment.isPending ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Submitted Answer Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogClose onClick={() => { setIsViewOpen(false); setViewing(null); }} />
          <DialogHeader><DialogTitle>{viewing?.title}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-tertiary">Subject</p>
                  <p className="text-text-primary font-medium">{viewing.subjectName}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Marks</p>
                  <p className="text-text-primary font-medium">{viewing.marks}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-text-tertiary">Your Answer</p>
                <div className="p-3 rounded-xl bg-surface-secondary text-sm text-text-primary whitespace-pre-wrap">
                  {viewing.studentAnswer || 'No answer submitted'}
                </div>
              </div>
              <Badge variant="success">Submitted</Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
