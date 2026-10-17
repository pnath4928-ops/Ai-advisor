import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studySessionApi } from '@/api/studySession';
import { useStudySessionStore } from '@/store/studySessionStore';
import { toast } from 'sonner';

export const useStudySession = () => {
  const queryClient = useQueryClient();
  const setActiveSession = useStudySessionStore((s) => s.setActiveSession);
  const reset = useStudySessionStore((s) => s.reset);

  const activeSessionQuery = useQuery({
    queryKey: ['student', 'sessions', 'active'],
    queryFn: studySessionApi.getActiveSession,
    refetchInterval: 30000,
  });

  const sessionTimersQuery = useQuery({
    queryKey: ['student', 'sessions', 'timers'],
    queryFn: studySessionApi.getSessionTimers,
    refetchInterval: 5000,
  });

  const sessionsByTask = (taskId: string) =>
    studySessionApi.getSessionsByTask(taskId);

  const startSession = useMutation({
    mutationFn: ({ studyTaskId, studyTopicId }: { studyTaskId: string; studyTopicId?: string }) =>
      studySessionApi.startSession({ studyTaskId, studyTopicId }),
    onSuccess: (data) => {
      setActiveSession(data);
      queryClient.invalidateQueries({ queryKey: ['student', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'topics'] });
      toast.success('Study session started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start session');
    },
  });

  const pauseSession = useMutation({
    mutationFn: studySessionApi.pauseSession,
    onSuccess: (data) => {
      setActiveSession(data);
      queryClient.invalidateQueries({ queryKey: ['student', 'sessions'] });
      toast.success('Session paused');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause session');
    },
  });

  const resumeSession = useMutation({
    mutationFn: studySessionApi.resumeSession,
    onSuccess: (data) => {
      setActiveSession(data);
      queryClient.invalidateQueries({ queryKey: ['student', 'sessions'] });
      toast.success('Session resumed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resume session');
    },
  });

  const endSession = useMutation({
    mutationFn: studySessionApi.endSession,
    onSuccess: (data) => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['student', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student'] });
      if (data.taskCompleted) {
        toast.success('Congratulations! You completed today\'s study goal.');
      } else {
        toast.success('Session ended');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to end session');
    },
  });

  return {
    activeSession: activeSessionQuery.data ?? null,
    sessionTimers: sessionTimersQuery.data ?? null,
    isLoadingActive: activeSessionQuery.isLoading,
    isLoadingTimers: sessionTimersQuery.isLoading,
    sessionsByTask,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
  };
};
