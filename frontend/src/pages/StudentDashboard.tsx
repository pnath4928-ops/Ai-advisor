import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/api/student";
import { aiApi } from "@/api/ai";
import { useStudentAnalytics } from "@/hooks/useAnalytics";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { DashboardStatsGrid } from "@/components/study/DashboardStatsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { MotionCard } from "@/components/motion/MotionCard";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { EmptyState } from "@/components/motion/EmptyState";
import { QueryErrorState } from "@/components/QueryErrorState";
import { Reveal } from "@/components/motion/Reveal";
import { StudyHoursChart } from "@/components/charts/StudyHoursChart";
import { SubjectPerformanceChart } from "@/components/charts/SubjectPerformanceChart";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import {
  CalendarCheck,
  ListTodo,
  GraduationCap,
  Sparkles,
  Clock,
  ArrowUpRight,
  Target,
  Zap,
  AlertTriangle,
  BookOpen,
  Play,
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: studyPlans } = useQuery({
    queryKey: ["student", "study-plans"],
    queryFn: studentApi.getStudyPlans,
  });

  const { data: tasks, isError: tasksError } = useQuery({
    queryKey: ["student", "tasks"],
    queryFn: studentApi.getTasks,
  });

  const { data: exams } = useQuery({
    queryKey: ["student", "exams"],
    queryFn: studentApi.getExams,
  });

  const { data: suggestions, isError: suggestionsError } = useQuery({
    queryKey: ["ai", "suggestions"],
    queryFn: () => aiApi.getSuggestions(),
  });

  const { data: weakSubjects } = useQuery({
    queryKey: ["ai", "weak-subjects"],
    queryFn: aiApi.analyzeWeakSubjects,
  });

  const generateSuggestion = useMutation({
    mutationFn: (type: "plan" | "daily" | "weakness" | "revision") =>
      aiApi.generateSuggestion(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "suggestions"] });
      toast.success("AI suggestion generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate AI suggestion");
    },
  });

  const generateFullPlan = useMutation({
    mutationFn: (scope?: "day" | "week") => aiApi.generateFullPlan(scope),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student", "study-plans"] });
      queryClient.invalidateQueries({ queryKey: ["student", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["ai", "suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["ai", "weak-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "student"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "student", "progress"] });
      toast.success(`Study plan generated with ${data.tasks.length} tasks!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate study plan");
    },
  });

  const [isScopeOpen, setIsScopeOpen] = useState(false);

  const recordCount = Number(
    weakSubjects?.overallAnalysis?.match(/out of (\d+) total subjects/)?.[1] ?? 0,
  );
  const hasAcademicData =
    recordCount > 0 || (exams?.length ?? 0) > 0 || (tasks?.length ?? 0) > 0;

  const openPlanDialog = () => {
    if (hasAcademicData) {
      setIsScopeOpen(true);
    } else {
      generateFullPlan.mutate("day");
    }
  };

  const activePlans =
    studyPlans?.filter((p: { status: string }) => p.status === "active")
      .length || 0;
  const pendingTasks =
    tasks?.filter((t: { status: string }) => t.status !== "completed").length ||
    0;
  const upcomingExams = exams?.length || 0;
  const unreadSuggestions =
    suggestions?.filter((s: { accepted: boolean }) => !s.accepted).length || 0;

  const { data: analytics, isError: analyticsError } = useStudentAnalytics();

  const hasError = tasksError || suggestionsError || analyticsError;

  const stats = [
    {
      label: "Active Plans",
      value: activePlans,
      icon: CalendarCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      icon: ListTodo,
      color: "text-warning",
      bg: "bg-warning-subtle",
    },
    {
      label: "Upcoming Exams",
      value: upcomingExams,
      icon: GraduationCap,
      color: "text-info",
      bg: "bg-info-subtle",
    },
    {
      label: "AI Suggestions",
      value: unreadSuggestions,
      icon: Sparkles,
      color: "text-success",
      bg: "bg-success-subtle",
    },
  ];

  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  const pendingTaskList =
    tasks
      ?.filter((t: { status: string }) => t.status !== "completed")
      .slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {user?.name || "Student"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here's your study overview for today
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={openPlanDialog}
            disabled={generateFullPlan.isPending}
          >
            {generateFullPlan.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Generating Plan...
              </span>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Generate AI Plan
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => generateSuggestion.mutate("daily")}
            disabled={generateSuggestion.isPending}
          >
            {generateSuggestion.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Advice
              </>
            )}
          </Button>
        </div>
      </div>

      <DashboardStatsGrid stats={dashboardStats} isLoading={statsLoading} />

      {hasError && (
        <QueryErrorState
          queryKey={["student", "tasks"]}
          message="Some dashboard data couldn't be loaded."
        />
      )}

      <MotionCard className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20 group">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">
                Ready to study?
              </p>
              <p className="text-sm text-text-secondary">
                Start a live study session with timer tracking
              </p>
            </div>
          </div>
          <Link to="/dashboard/student/study-sessions">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Start Studying
            </Button>
          </Link>
        </CardContent>
      </MotionCard>

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

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-warning-subtle">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Upcoming Tasks
                </CardTitle>
                <p className="text-xs text-text-secondary mt-0.5">
                  {pendingTasks} tasks pending
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingTaskList.length > 0 ? (
              <StaggerContainer className="space-y-2" stagger={0.06}>
                {pendingTaskList.map(
                  (task: {
                    _id: string;
                    subjectName: string;
                    day: string;
                    plannedMinutes: number;
                  }) => (
                    <StaggerItem
                      key={task._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm text-text-primary font-medium">
                            {task.subjectName}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {task.subjectName} · {task.day} ·{" "}
                            {task.plannedMinutes}min
                          </p>
                        </div>
                      </div>
                    </StaggerItem>
                  ),
                )}
              </StaggerContainer>
            ) : (
              <EmptyState
                icon={<Target className="w-6 h-6 text-success" />}
                title="All caught up!"
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openPlanDialog}
                    disabled={generateFullPlan.isPending}
                  >
                    <BookOpen className="w-3 h-3 mr-1.5" />
                    Generate Study Plan
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-text-primary">
                  AI Suggestions
                </CardTitle>
                <p className="text-xs text-text-secondary mt-0.5">
                  Personalized recommendations
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {suggestions && suggestions.length > 0 ? (
              <StaggerContainer className="space-y-2" stagger={0.06}>
                {suggestions
                  .slice(0, 4)
                  .map(
                    (suggestion: {
                      _id: string;
                      suggestionType: string;
                      reasoning: string;
                      accepted: boolean;
                    }) => (
                      <StaggerItem
                        key={suggestion._id}
                        className="p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant={
                              suggestion.accepted ? "success" : "default"
                            }
                          >
                            {suggestion.suggestionType}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2 mt-1.5">
                          {suggestion.reasoning}
                        </p>
                      </StaggerItem>
                    ),
                  )}
              </StaggerContainer>
            ) : (
              <EmptyState
                icon={<Sparkles className="w-6 h-6 text-primary" />}
                title="No suggestions yet"
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateSuggestion.mutate("plan")}
                    disabled={generateSuggestion.isPending}
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Get Recommendations
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {weakSubjects && weakSubjects.weakSubjects.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/15">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Weak Areas
                </CardTitle>
                <p className="text-xs text-text-secondary mt-0.5">
                  {weakSubjects.weakSubjects.length} subject(s) need attention
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateSuggestion.mutate("weakness")}
              disabled={generateSuggestion.isPending}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Analyze
            </Button>
          </CardHeader>
          <CardContent>
            <StaggerContainer className="space-y-3" stagger={0.06}>
              {weakSubjects.weakSubjects.map((weak) => (
                <StaggerItem
                  key={weak.subjectName}
                  className="p-3 rounded-xl bg-surface-secondary/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-text-primary">
                      {weak.subjectName}
                    </p>
                    <Badge variant="warning">{weak.score}%</Badge>
                  </div>
                  {weak.weakTopics.length > 0 && (
                    <p className="text-xs text-text-tertiary">
                      Weak topics: {weak.weakTopics.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary mt-1">
                    {weak.recommendation}
                  </p>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <p className="text-xs text-text-tertiary mt-3 italic">
              {weakSubjects.overallAnalysis}
            </p>
          </CardContent>
        </Card>
      )}

      {analytics &&
        (analytics.totalTasks > 0 || analytics.studyHoursData.length > 0) && (
          <Reveal className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {analytics.studyHoursData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-text-primary">
                    Weekly Study Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudyHoursChart data={analytics.studyHoursData} />
                </CardContent>
              </Card>
            )}
            {analytics.subjectPerformance.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-text-primary">
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SubjectPerformanceChart
                    data={analytics.subjectPerformance}
                  />
                </CardContent>
              </Card>
            )}
          </Reveal>
        )}

      <Dialog open={isScopeOpen} onOpenChange={setIsScopeOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsScopeOpen(false)} />
          <DialogHeader>
            <DialogTitle>Generate AI Study Plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            I'll analyze your assignments, exams, weak topics, and study progress
            to build the most effective plan. Which would you like?
          </p>
          <div className="flex flex-col gap-2 mt-1">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              disabled={generateFullPlan.isPending}
              onClick={() => {
                setIsScopeOpen(false);
                generateFullPlan.mutate("day");
              }}
            >
              <div className="text-left">
                <p className="font-medium">Today's Plan</p>
                <p className="text-xs text-text-secondary">
                  A focused plan for today only
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              disabled={generateFullPlan.isPending}
              onClick={() => {
                setIsScopeOpen(false);
                generateFullPlan.mutate("week");
              }}
            >
              <div className="text-left">
                <p className="font-medium">Full Week Plan</p>
                <p className="text-xs text-text-secondary">
                  Plan the rest of this week (today to Sunday)
                </p>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScopeOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
