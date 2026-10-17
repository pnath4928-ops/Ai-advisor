import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { useStudySession } from '@/hooks/useStudySession';
import type { StudyTopic } from '@/types';
import { Play, Pause, Square, CheckCircle, BookOpen } from 'lucide-react';

interface TopicSessionCardProps {
  topic: StudyTopic;
  taskId: string;
}

function formatTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TopicSessionCard({ topic, taskId }: TopicSessionCardProps) {
  const [justCompleted, setJustCompleted] = useState(false);

  const timer = useStudyTimer(topic.plannedMinutes);
  const session = useStudySession();

  const isThisTopicActive = session.activeSession?.studyTopicId === topic._id;

  useEffect(() => {
    if (session.activeSession?.studyTopicId === topic._id) {
      timer.setIsRunning(session.activeSession.status === 'active');
      timer.setIsPaused(session.activeSession.status === 'paused');
    }
  }, [session.activeSession?._id, session.activeSession?.status, topic._id]);

  const handleStart = async () => {
    try {
      const newSession = await session.startSession.mutateAsync({ studyTaskId: taskId, studyTopicId: topic._id });
      timer.startTimer();
      if (newSession) {
        timer.setIsRunning(true);
      }
    } catch {
      // handled in hook
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
      if (result.taskCompleted) setJustCompleted(true);
    }
  };

  const displayElapsed = isThisTopicActive ? timer.elapsed : topic.studiedMinutes;
  const displayRemaining = isThisTopicActive ? timer.remaining : topic.remainingMinutes;
  const displayProgress = isThisTopicActive ? timer.progress : topic.progressPercentage;
  const isCompleted = topic.status === 'completed' || justCompleted;

  return (
    <div className="p-3 rounded-lg bg-surface-secondary/50 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">{topic.topicName}</span>
        </div>
        {isCompleted ? (
          <Badge variant="success" className="text-xs">Done</Badge>
        ) : topic.status === 'in_progress' ? (
          <Badge variant="warning" className="text-xs">Active</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">{topic.plannedMinutes}min</Badge>
        )}
      </div>

      <Progress value={displayProgress} variant={isCompleted ? 'success' : 'default'} size="sm" />

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>Elapsed: {formatTime(displayElapsed)}</span>
        <span>Remaining: {formatTime(displayRemaining)}</span>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1">
        {isCompleted ? (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        ) : isThisTopicActive && timer.isPaused ? (
          <>
            <Button size="sm" variant="outline" onClick={handleResume} disabled={session.resumeSession.isPending}>
              <Play className="w-3 h-3 mr-1" /> Resume
            </Button>
            <Button size="sm" variant="destructive" onClick={handleEnd} disabled={session.endSession.isPending}>
              <Square className="w-3 h-3 mr-1" /> End
            </Button>
          </>
        ) : isThisTopicActive && timer.isRunning ? (
          <>
            <Button size="sm" variant="outline" onClick={handlePause} disabled={session.pauseSession.isPending}>
              <Pause className="w-3 h-3 mr-1" /> Pause
            </Button>
            <Button size="sm" variant="destructive" onClick={handleEnd} disabled={session.endSession.isPending}>
              <Square className="w-3 h-3 mr-1" /> End
            </Button>
          </>
        ) : session.activeSession && !isThisTopicActive ? (
          <span className="text-xs text-text-tertiary">Another topic active</span>
        ) : (
          <Button size="sm" onClick={handleStart} disabled={session.startSession.isPending}>
            {session.startSession.isPending ? (
              <span className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              <><Play className="w-3 h-3 mr-1" /> Start</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
