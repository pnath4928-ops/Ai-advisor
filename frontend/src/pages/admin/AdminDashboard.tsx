import { useAdminStats } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/QueryErrorState';
import { MotionCard } from '@/components/motion/MotionCard';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { Users, GraduationCap, BookOpen, ClipboardList, CalendarCheck, Sparkles } from 'lucide-react';

export const AdminDashboard = () => {
  const { data: stats, isLoading, isError } = useAdminStats();

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'text-success', bg: 'bg-success-subtle' },
    { label: 'Teachers', value: stats?.totalTeachers || 0, icon: BookOpen, color: 'text-info', bg: 'bg-info-subtle' },
    { label: 'Academic Records', value: stats?.totalAcademicRecords || 0, icon: ClipboardList, color: 'text-warning', bg: 'bg-warning-subtle' },
    { label: 'Study Plans', value: stats?.totalStudyPlans || 0, icon: CalendarCheck, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'AI Suggestions', value: stats?.totalAISuggestions || 0, icon: Sparkles, color: 'text-success', bg: 'bg-success-subtle' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">System overview and management</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton variant="rectangular" className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent>
            <QueryErrorState queryKey={['admin', 'stats']} message="We couldn't load system statistics." />
          </CardContent>
        </Card>
      ) : (
        <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <MotionCard className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${stat.bg}`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-primary">
                          <AnimatedCounter value={stat.value} />
                        </p>
                        <p className="text-xs text-text-secondary">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </MotionCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {stats?.usersByRole && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-text-primary">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-2xl font-bold text-text-primary">
                    <AnimatedCounter value={count} />
                  </p>
                  <p className="text-xs text-text-secondary capitalize">{role}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
