import api from '@/lib/api';

export interface TeacherAnalytics {
  gradeDistribution: Record<string, number>;
  subjectAverages: { subject: string; averageScore: number; recordCount: number }[];
  attendanceData: { subject: string; attendanceRate: number }[];
  topicRatings: { _id: string; count: number }[];
  submissionRate: number;
  totalStudents: number;
  totalRecords: number;
  totalAssignments: number;
}

export interface StudentAnalytics {
  studyHoursData: { week: string; hours: number }[];
  focusData: { date: string; focusScore: number }[];
  subjectPerformance: { subject: string; score: number; grade: string; attendanceRate: number }[];
  totalStudyHours: number;
  averageFocusScore: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  taskCompletionRate: number;
  todayStudyMinutes: number;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  currentSession: { elapsed: number; remaining: number } | null;
  studyStreak: number;
  longestSession: number;
  averageSessionLength: number;
}

import type { StudentProgressData } from '@/types';

export const analyticsApi = {
  getTeacherAnalytics: async (): Promise<TeacherAnalytics> => {
    const response = await api.get('/analytics/teacher');
    return response.data;
  },
  getStudentAnalytics: async (): Promise<StudentAnalytics> => {
    const response = await api.get('/analytics/student');
    return response.data;
  },
  getStudentProgress: async (): Promise<StudentProgressData> => {
    const response = await api.get('/analytics/student/progress');
    return response.data;
  },
};
