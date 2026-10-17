import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CircularProgress } from './CircularProgress';
import { CompletionAnimation } from './CompletionAnimation';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { useStudySession } from '@/hooks/useStudySession';
import type { StudyTask } from '@/types';
import { Play, Pause, Square, CheckCircle } from 'lucide-react';

interface SessionTimerProps {
  task: StudyTask;
}

function formatTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function SessionTimer({ task }: SessionTimerProps) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const timer = useStudyTimer(task.plannedMinutes);
  const session = useStudySession();

  const isThisTaskActive = timer.activeSession?.studyTaskId === task._id;

  useEffect(() => {
    if (session.activeSession && session.activeSession.studyTaskId === task._id) {
      timer.setIsRunning(session.activeSession.status === 'active');
      timer.setIsPaused(session.activeSession.status === 'paused');
    }
  }, [session.activeSession?._id, session.activeSession?.status, task._id]);

  const handleStart = async () => {
    try {
      const newSession = await session.startSession.mutateAsync({ studyTaskId: task._id });
      timer.startTimer();
      if (newSession) {
        timer.setIsRunning(true);
      }
    } catch {
      // error handled in hook
    }
  };

  const handlePause = async () => {
    if (timer.activeSession) {
      await session.pauseSession.mutateAsync(timer.activeSession._id);
      timer.pauseTimer();
    }
  };

  const handleResume = async () => {
    if (timer.activeSession) {
      await session.resumeSession.mutateAsync(timer.activeSession._id);
      timer.resumeTimer();
    }
  };

  const handleEnd = async () => {
    if (timer.activeSession) {
      const result = await session.endSession.mutateAsync(timer.activeSession._id);
      timer.stopTimer();
      if (result.taskCompleted) {
        setJustCompleted(true);
        setShowCompletion(true);
      }
    }
  };

  const displayElapsed = isThisTaskActive ? timer.elapsed : task.studiedMinutes;
  const displayRemaining = isThisTaskActive ? timer.remaining : task.remainingMinutes;
  const displayProgress = isThisTaskActive ? timer.progress : task.progressPercentage;

  const isCompleted = task.status === 'completed' || justCompleted;

  return (
    <div className="space-y-4">
      <CompletionAnimation
        show={showCompletion}
        onComplete={() => setShowCompletion(false)}
      />

      <div className="flex items-center justify-center">
        <CircularProgress value={displayProgress} size={100} strokeWidth={6} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-text-secondary mb-1">Elapsed</p>
          <p className="text-lg font-mono font-bold text-text-primary">
            {formatTime(displayElapsed)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">Remaining</p>
          <p className="text-lg font-mono font-bold text-text-primary">
            {formatTime(displayRemaining)}
          </p>
        </div>
      </div>

      <Progress value={displayProgress} variant={isCompleted ? 'success' : 'default'} size="lg" />

      <div className="flex items-center justify-center gap-2">
        {isCompleted ? (
          <Badge variant="success" className="text-sm px-4 py-1.5">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Completed Automatically
          </Badge>
        ) : isThisTaskActive && timer.isPaused ? (
          <>
            <Button size="sm" onClick={handleResume} disabled={session.resumeSession.isPending}>
              <Play className="w-4 h-4 mr-1.5" />
              Resume
            </Button>
            <Button size="sm" variant="destructive" onClick={handleEnd} disabled={session.endSession.isPending}>
              <Square className="w-4 h-4 mr-1.5" />
              End Session
            </Button>
          </>
        ) : isThisTaskActive && timer.isRunning ? (
          <>
            <Button size="sm" variant="secondary" onClick={handlePause} disabled={session.pauseSession.isPending}>
              <Pause className="w-4 h-4 mr-1.5" />
              Pause
            </Button>
            <Button size="sm" variant="destructive" onClick={handleEnd} disabled={session.endSession.isPending}>
              <Square className="w-4 h-4 mr-1.5" />
              End Session
            </Button>
          </>
        ) : task.status === 'in_progress' && !isThisTaskActive ? (
          <Badge variant="warning" className="text-sm px-4 py-1.5">
            Session active on another task
          </Badge>
        ) : (
          <Button size="sm" onClick={handleStart} disabled={session.startSession.isPending}>
            {session.startSession.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                Start Study
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex justify-center">
        {isCompleted ? (
          <Badge variant="success">Completed</Badge>
        ) : task.status === 'in_progress' ? (
          <Badge variant="warning">In Progress</Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        )}
      </div>
    </div>
  );
}
