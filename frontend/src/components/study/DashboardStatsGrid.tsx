import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import type { DashboardStats } from '@/types';
import { Clock, CalendarDays, Calendar, Flame, CheckCircle, ListTodo, Trophy, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardStatsGridProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type StatItem = {
  label: string;
  value: ReactNode;
  count?: number;
  minutes?: number;
  icon: LucideIcon;
  color: string;
  bg: string;
};

export function DashboardStatsGrid({ stats, isLoading }: DashboardStatsGridProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-20 mb-2">
                <Skeleton variant="text" />
              </div>
              <Skeleton variant="text" className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items: StatItem[] = [
    {
      label: "Today's Study",
      value: formatMinutes(stats.todayStudyMinutes),
      minutes: stats.todayStudyMinutes,
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Weekly Study',
      value: formatMinutes(stats.weeklyStudyMinutes),
      minutes: stats.weeklyStudyMinutes,
      icon: CalendarDays,
      color: 'text-info',
      bg: 'bg-info-subtle',
    },
    {
      label: 'Monthly Study',
      value: formatMinutes(stats.monthlyStudyMinutes),
      minutes: stats.monthlyStudyMinutes,
      icon: Calendar,
      color: 'text-success',
      bg: 'bg-success-subtle',
    },
    {
      label: 'Study Streak',
      value: `${stats.studyStreak} days`,
      count: stats.studyStreak,
      icon: Flame,
      color: 'text-warning',
      bg: 'bg-warning-subtle',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      count: stats.completedTasks,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success-subtle',
    },
    {
      label: 'Remaining Tasks',
      value: stats.remainingTasks,
      count: stats.remainingTasks,
      icon: ListTodo,
      color: 'text-warning',
      bg: 'bg-warning-subtle',
    },
    {
      label: 'Longest Session',
      value: formatMinutes(stats.longestSession),
      minutes: stats.longestSession,
      icon: Trophy,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avg Session',
      value: formatMinutes(stats.averageSessionLength),
      minutes: stats.averageSessionLength,
      icon: BarChart3,
      color: 'text-info',
      bg: 'bg-info-subtle',
    },
  ];

  return (
    <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <StaggerItem key={item.label}>
            <Card className="group h-full hover:glow-purple transition-[box-shadow,border-color] duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>
                <p className="text-xl font-bold text-text-primary">
                  {item.count !== undefined ? (
                    <AnimatedCounter value={item.count} suffix={item.label === 'Study Streak' ? ' days' : ''} />
                  ) : item.minutes !== undefined ? (
                    <AnimatedCounter value={item.minutes} format={formatMinutes} />
                  ) : (
                    item.value
                  )}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{item.label}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
