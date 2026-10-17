import { motion } from 'framer-motion';
import { useStudentProgress } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import {
  Clock, Target, Brain, BookOpen, CheckCircle2,
  AlertTriangle, Trophy, TrendingUp,
} from 'lucide-react';

export const StudentProgressPage = () => {
  const { data: progress, isLoading, isError } = useStudentProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-text-tertiary">
          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading progress data...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <QueryErrorState queryKey={['analytics', 'student', 'progress']} message="We couldn't load your progress." />
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <EmptyState
            icon={<TrendingUp className="w-6 h-6 text-text-tertiary" />}
            title="No progress data available yet."
          />
        </CardContent>
      </Card>
    );
  }

  const overviewCards = [
    { label: 'Study Hours', value: `${progress.totalStudyHours}h`, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Today', value: `${progress.todayMinutes}m`, icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'This Week', value: `${progress.weekMinutes}m`, icon: Brain, color: 'text-success', bg: 'bg-success/10' },
    { label: 'This Month', value: `${progress.monthMinutes}m`, icon: BookOpen, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Tasks Done', value: `${progress.completedTasks}/${progress.totalTasks}`, icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Focus Score', value: `${progress.avgFocusScore}/10`, icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Streak', value: `${progress.studyStreak} days`, icon: Trophy, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'GPA', value: progress.avgGpa.toFixed(2), icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Progress</h1>
        <p className="text-sm text-text-secondary mt-1">Your learning journey at a glance</p>
      </div>

      {/* Overview Cards */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" stagger={0.06}>
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <StaggerItem key={card.label}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${card.bg}`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">{card.label}</p>
                      <p className="text-lg font-bold text-text-primary">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Study Hours Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Daily Study Minutes (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progress.charts.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C2233', border: '1px solid rgba(124, 92, 255, 0.2)', borderRadius: '8px', color: '#E8E8ED' }}
                />
                <Bar dataKey="minutes" fill="#7C5CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Weekly Study Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progress.charts.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C2233', border: '1px solid rgba(124, 92, 255, 0.2)', borderRadius: '8px', color: '#E8E8ED' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task & Assignment & Exam Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Completion Rate</span>
                <span className="font-semibold">{progress.taskCompletionRate}%</span>
              </div>
              <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.taskCompletionRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>{progress.completedTasks} completed</span>
                <span>{progress.totalTasks} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Submitted</span>
                <span className="font-semibold">{progress.submittedAssignments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Avg Score</span>
                <span className="font-semibold">{progress.avgAssignmentScore}%</span>
              </div>
              {progress.assignments.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {progress.assignments.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs text-text-tertiary">
                      <span className="truncate max-w-[120px]">{a.title}</span>
                      <Badge variant={a.submitted ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {a.submitted ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Upcoming</span>
                <span className="font-semibold">{progress.upcomingExams}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Completed</span>
                <span className="font-semibold">{progress.completedExams}</span>
              </div>
              {progress.exams.filter(e => e.status === 'upcoming').length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {progress.exams.filter(e => e.status === 'upcoming').slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-xs text-text-tertiary">
                      <span className="truncate max-w-[120px]">{e.subjectName}</span>
                      <span>{new Date(e.examDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance */}
      {progress.performanceByTerm.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Academic Performance by Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {progress.performanceByTerm.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t.term}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(t.gpa / 4) * 100}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 * (i + 1) }}
                        style={{
                          backgroundColor: t.gpa >= 3 ? '#22C55E' : t.gpa >= 2 ? '#EAB308' : '#EF4444',
                        }}
                      />
                    </div>
                    <span className="font-semibold text-xs w-6 text-right">{t.gpa.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                <span className="text-text-primary">Cumulative GPA</span>
                <span className="text-primary">{progress.avgGpa.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" stagger={0.06}>
            {progress.achievements.map((a, i) => (
              <StaggerItem
                key={i}
                className={`p-3 rounded-xl text-center transition-all ${a.earned ? 'bg-primary/10 border border-primary/20' : 'bg-surface-secondary opacity-50'}`}
              >
                <Trophy className={`w-5 h-5 mx-auto mb-1 ${a.earned ? 'text-warning' : 'text-text-tertiary'}`} />
                <p className="text-xs font-medium text-text-primary">{a.title}</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">{a.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </CardContent>
      </Card>
    </div>
  );
};