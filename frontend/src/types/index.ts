export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface Student {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  studentId: string;
  gradeLevel: string;
  section: string;
  learningPreference: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredStudyTime: string;
  preferredStudyTechnique: string;
  academicGoal: string;
}

export interface Teacher {
  _id: string;
  userId: string;
  teacherId: string;
  department: string;
  designation: string;
  assignedSubjects: string[];
  assignedClasses: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  profile?: Student | Teacher;
}

export interface AcademicRecord {
  _id: string;
  teacherId: string;
  studentId: string | { _id: string; studentId: string; gradeLevel: string };
  subjectName: string;
  term: string;
  totalClasses: number;
  attendedClasses: number;
  score: number;
  grade: string;
  teacherNotes: string;
}

export interface SubjectTopic {
  _id: string;
  academicRecordId: string | { _id: string; subjectName: string; studentId: string };
  topicName: string;
  rating: 'excellent' | 'good' | 'average' | 'needs_improvement';
  remarks: string;
}

export interface Assignment {
  _id: string;
  teacherId: string;
  academicRecordId?: string;
  studentId?: string | { _id: string; studentId: string; gradeLevel: string };
  title: string;
  description?: string;
  subjectName: string;
  dueDate: string;
  marks: number;
  submitted: boolean;
  studentAnswer?: string;
  submittedAt?: string;
}

export interface StudyPlan {
  _id: string;
  studentId: string;
  weekStartDate: string;
  status: 'active' | 'completed' | 'archived';
}

export interface StudyTopic {
  _id: string;
  studyTaskId: string;
  topicName: string;
  plannedMinutes: number;
  studiedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  _id: string;
  studyPlanId: string;
  day: string;
  subjectName: string;
  plannedMinutes: number;
  studiedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  studyTechnique: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface StudySession {
  _id: string;
  studentId: string;
  studyTaskId: string;
  studyTopicId?: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  status: 'active' | 'paused' | 'completed';
  pausedAt?: string;
  resumedAt?: string;
  createdAt: string;
}

export interface SessionTimer {
  active: boolean;
  sessionId?: string;
  status?: 'active' | 'paused';
  startTime?: string;
  elapsedMinutes?: number;
  remainingMinutes?: number;
  progressPercentage?: number;
}

export interface CurrentSessionInfo {
  elapsed: number;
  remaining: number;
}

export interface DashboardStats {
  todayStudyMinutes: number;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  completedTasks: number;
  remainingTasks: number;
  currentSession: CurrentSessionInfo | null;
  studyStreak: number;
  longestSession: number;
  averageSessionLength: number;
}

export interface StudyProgress {
  _id: string;
  studentId: string;
  studyTaskId: string;
  actualMinutes: number;
  focusScore: number;
  notes: string;
  completedAt: string;
}

export interface Exam {
  _id: string;
  studentId: string;
  subjectName: string;
  examType: string;
  examDate: string;
  preparationLevel: number;
}

export interface AISuggestion {
  _id: string;
  studyPlanId: string;
  suggestionType: string;
  targetDay: string;
  reasoning: string;
  recommendedAction: string;
  accepted: boolean;
  createdAt: string;
}

export interface StudentProgressData {
  totalStudyHours: number;
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  avgFocusScore: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  submittedAssignments: number;
  avgAssignmentScore: number;
  upcomingExams: number;
  completedExams: number;
  avgExamScore: number;
  avgGpa: number;
  studyStreak: number;
  assignments: Array<{ id: string; title: string; submitted: boolean; marks: number; submittedAt?: string }>;
  exams: Array<{ id: string; subjectName: string; examDate: string; preparationLevel: number; status: string }>;
  performanceByTerm: Array<{ term: string; gpa: number }>;
  recentSessions: Array<{ id: string; date: string; durationMinutes: number; status: string; studyTaskId: string }>;
  achievements: Array<{ title: string; description: string; earned: boolean; earnedAt?: string }>;
  charts: { daily: Array<{ date: string; minutes: number }>; weekly: Array<{ week: string; minutes: number }> };
}

export interface AdvisorData {
  overallStudyScore: number;
  todayRecommendation: string;
  weakSubjects: {
    red: Array<{ subjectName: string; score: number; teacherNotes: string }>;
    yellow: Array<{ subjectName: string; score: number; teacherNotes: string }>;
    green: Array<{ subjectName: string; score: number; teacherNotes: string }>;
  };
  teacherFeedback: Array<{ subjectName: string; feedback: string; score: number }>;
  studyHabitAnalysis: {
    plannedMinutesThisWeek: number;
    actualMinutesThisWeek: number;
    weeklyAdherence: number;
    totalSessions: number;
    sessionsThisWeek: number;
    sessionsThisMonth: number;
    averageDailyMinutes: number;
    consistencyScore: number;
  };
  examCountdowns: Array<{ title: string; subjectName: string; date: string; daysRemaining: number; preparationLevel: number }>;
}
