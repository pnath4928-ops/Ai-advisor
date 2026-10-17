import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import { TaskCard } from '@/components/study/TaskCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import type { StudyTask } from '@/types';
import { BookOpen, ListTodo } from 'lucide-react';

export const StudyTasksPage = () => {
  const [tab, setTab] = useState('all');

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['student', 'tasks'],
    queryFn: studentApi.getTasks,
    refetchInterval: 10000,
  });

  const filterByStatus = (status: string) => {
    if (status === 'all') return tasks || [];
    return (tasks || []).filter((t: StudyTask) => t.status === status);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-5 w-32 mb-3">
                  <Skeleton variant="text" />
                </div>
                <div className="h-4 w-24 mb-4">
                  <Skeleton variant="text" />
                </div>
                <Skeleton variant="rectangular" className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <QueryErrorState queryKey={['student', 'tasks']} message="We couldn't load your study tasks." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Study Tasks</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and manage your study sessions
          </p>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <EmptyState
              icon={<ListTodo className="w-6 h-6 text-text-secondary" />}
              title="No study tasks yet"
              description="Create a study plan with tasks to get started"
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'in_progress', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <StaggerContainer className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
                {filterByStatus(tab).length > 0 ? (
                  filterByStatus(tab).map((task: StudyTask) => (
                    <StaggerItem key={task._id} className="h-full">
                      <TaskCard task={task} />
                    </StaggerItem>
                  ))
                ) : (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <EmptyState
                          icon={<BookOpen className="w-5 h-5 text-text-secondary" />}
                          title="No tasks found"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </StaggerContainer>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
