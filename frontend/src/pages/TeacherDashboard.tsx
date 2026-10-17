import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { teacherApi } from '@/api/teacher';
import { useTeacherAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MotionCard } from '@/components/motion/MotionCard';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Reveal } from '@/components/motion/Reveal';
import { Avatar } from '@/components/motion/Avatar';
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { useAuthStore } from '@/store/authStore';
import { populatedName } from '@/lib/utils';
import {
  Users,
  BarChart3,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: students, isLoading: studentsLoading, isError: studentsError } = useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: teacherApi.getStudents,
  });

  const { data: records } = useQuery({
    queryKey: ['teacher', 'academicRecords'],
    queryFn: teacherApi.getAcademicRecords,
  });

  const { data: assignments } = useQuery({
    queryKey: ['teacher', 'assignments'],
    queryFn: teacherApi.getAssignments,
  });

  const { data: analytics, isError: analyticsError } = useTeacherAnalytics();

  const totalStudents = students?.length || 0;
  const totalRecords = records?.length || 0;
  const totalAssignments = assignments?.length || 0;
  const pendingAssignments = assignments?.filter((a: { submitted: boolean }) => !a.submitted).length || 0;

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Academic Records', value: totalRecords, icon: BarChart3, color: 'text-success', bg: 'bg-success-subtle' },
    { label: 'Assignments', value: totalAssignments, icon: ClipboardList, color: 'text-info', bg: 'bg-info-subtle' },
    { label: 'Pending Review', value: pendingAssignments, icon: ClipboardList, color: 'text-warning', bg: 'bg-warning-subtle' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {user?.name || 'Teacher'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here's what's happening with your classes
          </p>
        </div>
      </div>

      <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.label}>
              <MotionCard className="group h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
                </CardContent>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-text-primary">Students</CardTitle>
                <p className="text-xs text-text-secondary mt-0.5">{totalStudents} total students</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {studentsError ? (
              <QueryErrorState queryKey={['teacher', 'students']} message="We couldn't load your students." />
            ) : studentsLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-surface-secondary animate-pulse" />
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <StaggerContainer className="space-y-2" stagger={0.06}>
                {students.slice(0, 6).map((student) => {
                  const userName = populatedName(student.userId);
                  return (
                  <StaggerItem key={student._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={userName} />
                      <div>
                        <p className="text-sm text-text-primary font-medium">{userName}</p>
                        <p className="text-xs text-text-tertiary uppercase tracking-wider">{student.studentId}</p>
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary">Grade {student.gradeLevel}</span>
                  </StaggerItem>
                  );
                })}
              </StaggerContainer>
            ) : (
              <EmptyState
                icon={<Users className="w-6 h-6 text-text-tertiary" />}
                title="No students assigned"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-info-subtle">
                <ClipboardList className="w-4 h-4 text-info" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-text-primary">Quick Actions</CardTitle>
                <p className="text-xs text-text-secondary mt-0.5">Manage your classes</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StaggerContainer className="space-y-2" stagger={0.08}>
              {[
                { icon: ClipboardList, label: 'Create Assignment', desc: 'Add new task for students', color: 'text-primary', bg: 'bg-primary/10', path: '/dashboard/teacher/assignments' },
                { icon: BarChart3, label: 'Grade Records', desc: 'Review student performance', color: 'text-info', bg: 'bg-info-subtle', path: '/dashboard/teacher/academic-records' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <StaggerItem key={action.label}>
                    <motion.button
                      onClick={() => navigate(action.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors text-left cursor-pointer"
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <div className={`p-2 rounded-lg ${action.bg}`}>
                        <Icon className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">{action.label}</p>
                        <p className="text-xs text-text-tertiary">{action.desc}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-text-tertiary ml-auto" />
                    </motion.button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </CardContent>
        </Card>
      </div>

      {analyticsError && (
        <Card>
          <CardContent>
            <QueryErrorState queryKey={['analytics', 'teacher']} message="We couldn't load analytics." />
          </CardContent>
        </Card>
      )}

      {analytics && (analytics.totalRecords > 0 || analytics.totalAssignments > 0) && (
        <Reveal className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {Object.keys(analytics.gradeDistribution).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <GradeDistributionChart data={analytics.gradeDistribution} />
              </CardContent>
            </Card>
          )}
          {analytics.attendanceData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary">Attendance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceChart data={analytics.attendanceData} />
              </CardContent>
            </Card>
          )}
        </Reveal>
      )}
    </div>
  );
};
