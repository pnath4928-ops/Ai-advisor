import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SessionTimer } from './SessionTimer';
import { TopicSessionCard } from './TopicSessionCard';
import { QueryErrorState } from '@/components/QueryErrorState';
import { useQuery } from '@tanstack/react-query';
import { studyTopicApi } from '@/api/studyTopic';
import type { StudyTask } from '@/types';
import { BookOpen, Clock, CheckCircle, Layers } from 'lucide-react';

interface TaskCardProps {
  task: StudyTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const { data: topics = [], isError } = useQuery({
    queryKey: ['student', 'topics', 'task', task._id],
    queryFn: () => studyTopicApi.getTopicsByTask(task._id),
    refetchInterval: 10000,
  });

  const hasTopics = topics.length > 0;

  return (
    <Card className="group hover:glow-purple transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${
              task.status === 'completed'
                ? 'bg-success-subtle'
                : task.status === 'in_progress'
                  ? 'bg-warning-subtle'
                  : 'bg-surface-secondary'
            }`}>
              {task.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <BookOpen className={`w-5 h-5 ${
                  task.status === 'in_progress' ? 'text-warning' : 'text-text-secondary'
                }`} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{task.subjectName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'}>
                  {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </Badge>
                <span className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.plannedMinutes} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {isError ? (
          <QueryErrorState
            queryKey={['student', 'topics', 'task', task._id]}
            message="Couldn't load topics."
          />
        ) : hasTopics ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-1">
              <Layers className="w-3 h-3" />
              <span>Topics ({topics.length})</span>
            </div>
            {topics.map((topic) => (
              <TopicSessionCard key={topic._id} topic={topic} taskId={task._id} />
            ))}
          </div>
        ) : (
          task.status === 'completed' ? (
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {task.studiedMinutes} / {task.plannedMinutes} minutes
                </span>
                <span className="text-sm ml-2">100%</span>
              </div>
            </div>
          ) : (
            <SessionTimer task={task} />
          )
        )}
      </CardContent>
    </Card>
  );
}
