import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiApi } from '@/api/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import {
  Sparkles, Brain, AlertTriangle, Clock, MessageSquare,
  BookOpen, Send, BarChart3, WifiOff,
} from 'lucide-react';

type ChatMessage = { role: 'user' | 'ai'; text: string };
type ChatPayload = { question: string; history: ChatMessage[] };

export const AIAdvisorPage = () => {
  const { data: advisor, isLoading, isError } = useQuery({
    queryKey: ['ai', 'advisor'],
    queryFn: aiApi.getAdvisor,
    staleTime: 5 * 60 * 1000,
  });

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const askMutation = useMutation({
    mutationFn: ({ question, history }: ChatPayload) => aiApi.askAI(question, history),
    onSuccess: (data) => {
      setIsOffline(data.offline);
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    },
    onError: () => {
      setIsOffline(true);
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    },
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || askMutation.isPending) return;
    const history = messages.slice(-8);
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    askMutation.mutate({ question: q, history });
    setQuestion('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-text-tertiary">
          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading advisor data...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <QueryErrorState queryKey={['ai', 'advisor']} message="We couldn't load your advisor insights." />
        </CardContent>
      </Card>
    );
  }

  if (!advisor) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <EmptyState
            icon={<Sparkles className="w-6 h-6 text-text-tertiary" />}
            title="No advisor data available yet."
            description="Start studying to get personalized insights!"
          />
        </CardContent>
      </Card>
    );
  }

  const scoreColor = advisor.overallStudyScore >= 70 ? 'text-success' : advisor.overallStudyScore >= 40 ? 'text-warning' : 'text-danger';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Advisor
        </h1>
        <p className="text-sm text-text-secondary mt-1">Personalized insights powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score + Today's Recommendation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Study Score */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <p className="text-sm text-text-tertiary mb-2">Overall Study Score</p>
              <div className="relative w-32 h-32 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={advisor.overallStudyScore >= 70 ? '#22C55E' : advisor.overallStudyScore >= 40 ? '#EAB308' : '#EF4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="339.292 339.292"
                    initial={{ strokeDashoffset: 339.292 }}
                    animate={{ strokeDashoffset: 339.292 * (1 - advisor.overallStudyScore / 100) }}
                    transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 1, delay: 0.15 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor}`}>{advisor.overallStudyScore}</span>
                </div>
              </div>
              <p className="text-xs text-text-tertiary">out of 100</p>
            </CardContent>
          </Card>

          {/* Today's Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Today's Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-primary leading-relaxed">{advisor.todayRecommendation}</p>
            </CardContent>
          </Card>

          {/* Study Habit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                Study Habit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-text-tertiary">Planned (Week)</p>
                  <p className="text-lg font-bold text-text-primary">{advisor.studyHabitAnalysis.plannedMinutesThisWeek}m</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Actual (Week)</p>
                  <p className="text-lg font-bold text-text-primary">{advisor.studyHabitAnalysis.actualMinutesThisWeek}m</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Adherence</p>
                  <p className={`text-lg font-bold ${advisor.studyHabitAnalysis.weeklyAdherence >= 70 ? 'text-success' : 'text-warning'}`}>{advisor.studyHabitAnalysis.weeklyAdherence}%</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Consistency</p>
                  <p className={`text-lg font-bold ${advisor.studyHabitAnalysis.consistencyScore >= 70 ? 'text-success' : 'text-warning'}`}>{advisor.studyHabitAnalysis.consistencyScore}%</p>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, advisor.studyHabitAnalysis.weeklyAdherence)}%` }}
                  transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.8, delay: 0.3 }}
                  style={{
                    backgroundColor: advisor.studyHabitAnalysis.weeklyAdherence >= 70 ? '#22C55E' : '#EAB308',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>Planned: {advisor.studyHabitAnalysis.plannedMinutesThisWeek}m</span>
                <span>Actual: {advisor.studyHabitAnalysis.actualMinutesThisWeek}m</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-xs text-text-tertiary">Total Sessions</p>
                  <p className="text-sm font-semibold">{advisor.studyHabitAnalysis.totalSessions}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">This Week</p>
                  <p className="text-sm font-semibold">{advisor.studyHabitAnalysis.sessionsThisWeek}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">This Month</p>
                  <p className="text-sm font-semibold">{advisor.studyHabitAnalysis.sessionsThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weak Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {advisor.weakSubjects.red.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-danger mb-1">Needs Attention (&lt;60%)</p>
                  {advisor.weakSubjects.red.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs text-text-secondary py-1">
                      <span>{s.subjectName}</span>
                      <span className="text-danger font-medium">{s.score}%</span>
                    </div>
                  ))}
                </div>
              )}
              {advisor.weakSubjects.yellow.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-warning mb-1">Improving (60-74%)</p>
                  {advisor.weakSubjects.yellow.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs text-text-secondary py-1">
                      <span>{s.subjectName}</span>
                      <span className="text-warning font-medium">{s.score}%</span>
                    </div>
                  ))}
                </div>
              )}
              {advisor.weakSubjects.green.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-success mb-1">Strong (&ge;75%)</p>
                  {advisor.weakSubjects.green.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs text-text-secondary py-1">
                      <span>{s.subjectName}</span>
                      <span className="text-success font-medium">{s.score}%</span>
                    </div>
                  ))}
                </div>
              )}
              {advisor.weakSubjects.red.length === 0 && advisor.weakSubjects.yellow.length === 0 && advisor.weakSubjects.green.length === 0 && (
                <p className="text-xs text-text-tertiary">No academic records yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Teacher Feedback */}
          {advisor.teacherFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  Teacher Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                {advisor.teacherFeedback.map((f, i) => (
                  <div key={i} className="p-2 rounded-lg bg-surface-secondary">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-text-primary">{f.subjectName}</span>
                      <Badge variant={f.score >= 75 ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">{f.score}%</Badge>
                    </div>
                    <p className="text-[11px] text-text-tertiary">{f.feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Exam Countdowns */}
          {advisor.examCountdowns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Exam Countdowns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {advisor.examCountdowns.map((e, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text-primary">{e.subjectName}</p>
                      <p className="text-[10px] text-text-tertiary">{new Date(e.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${e.daysRemaining <= 7 ? 'text-danger' : e.daysRemaining <= 30 ? 'text-warning' : 'text-success'}`}>
                        {e.daysRemaining}d
                      </p>
                      <p className="text-[10px] text-text-tertiary">Prep: {e.preparationLevel}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Ask AI Chatbot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Ask AI Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isOffline && (
            <p className="text-[11px] text-warning flex items-center gap-1 mb-2">
              <WifiOff className="w-3 h-3" />
              Offline mode — AI service is unavailable, using fallback answers.
            </p>
          )}
          <div className="space-y-4 max-h-80 overflow-y-auto mb-4 p-3 rounded-xl bg-surface-secondary">
            {messages.length === 0 && (
              <p className="text-xs text-text-tertiary text-center py-6">
                I know your assignments, exams, scores, study plans, and progress — just ask! <br />
                E.g., "Which assignments are due this week?", "Am I ready for my math exam?",
                or "How can I improve my weak topics?"
              </p>
            )}
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={`${i}-${m.text.slice(0, 12)}`}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-surface text-text-primary rounded-bl-md border border-border'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {askMutation.isPending && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="max-w-[80%] p-3 rounded-2xl bg-surface border border-border">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
                </div>
              </motion.div>
            )}
          </div>
          <form onSubmit={handleAsk} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your studies..."
              className="flex-1"
            />
            <Button type="submit" disabled={!question.trim() || askMutation.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};