import { AcademicRecord } from '../models/AcademicRecord';
import { SubjectTopic } from '../models/SubjectTopic';
import { Assignment } from '../models/Assignment';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { StudyProgress } from '../models/StudyProgress';
import { StudyPlan } from '../models/StudyPlan';
import { StudyTask } from '../models/StudyTask';
import { StudySession } from '../models/StudySession';
import { Exam } from '../models/Exam';

export const getTeacherAnalytics = async (teacherId: string) => {
  const teacher = await Teacher.findOne({ userId: teacherId });
  if (!teacher) throw new Error('Teacher profile not found');

  const records = await AcademicRecord.find({ teacherId: teacher._id });

  const gradeDistribution: Record<string, number> = {};
  for (const r of records) {
    gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
  }

  const subjectScores: Record<string, { total: number; count: number }> = {};
  for (const r of records) {
    if (!subjectScores[r.subjectName]) subjectScores[r.subjectName] = { total: 0, count: 0 };
    subjectScores[r.subjectName].total += r.score;
    subjectScores[r.subjectName].count += 1;
  }

  const subjectAverages = Object.entries(subjectScores).map(([subject, data]) => ({
    subject,
    averageScore: Math.round(data.total / data.count),
    recordCount: data.count,
  }));

  const attendanceBySubject: Record<string, { attended: number; total: number }> = {};
  for (const r of records) {
    if (!attendanceBySubject[r.subjectName]) attendanceBySubject[r.subjectName] = { attended: 0, total: 0 };
    attendanceBySubject[r.subjectName].attended += r.attendedClasses;
    attendanceBySubject[r.subjectName].total += r.totalClasses;
  }
  const attendanceData = Object.entries(attendanceBySubject).map(([subject, data]) => ({
    subject,
    attendanceRate: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
  }));

  const topicRatings = await SubjectTopic.aggregate([
    {
      $lookup: { from: 'academicrecords', localField: 'academicRecordId', foreignField: '_id', as: 'record' },
    },
    { $unwind: '$record' },
    { $match: { 'record.teacherId': teacher._id } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const assignments = await Assignment.find({ teacherId: teacher._id });
  const submittedCount = assignments.filter(a => a.submitted).length;
  const submissionRate = assignments.length > 0 ? Math.round((submittedCount / assignments.length) * 100) : 0;

  const studentIds = [...new Set(records.map(r => r.studentId.toString()))];

  return {
    gradeDistribution,
    subjectAverages,
    attendanceData,
    topicRatings,
    submissionRate,
    totalStudents: studentIds.length,
    totalRecords: records.length,
    totalAssignments: assignments.length,
  };
};

export const getStudentAnalytics = async (userId: string) => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student profile not found');
  const studentId = student._id;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const progress = await StudyProgress.find({
    studentId,
    completedAt: { $gte: fourWeeksAgo },
  }).sort({ completedAt: 1 });

  const weeklyHours: Record<string, number> = {};
  for (const p of progress) {
    const d = new Date(p.completedAt);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    const key = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weeklyHours[key] = (weeklyHours[key] || 0) + p.actualMinutes / 60;
  }

  const studyHoursData = Object.entries(weeklyHours).map(([week, hours]) => ({
    week,
    hours: Math.round(hours * 10) / 10,
  }));

  const focusData = progress.map(p => ({
    date: new Date(p.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    focusScore: p.focusScore,
  }));

  const records = await AcademicRecord.find({ studentId });
  const subjectPerformance = records.map(r => ({
    subject: r.subjectName,
    score: r.score,
    grade: r.grade,
    attendanceRate: r.totalClasses > 0 ? Math.round((r.attendedClasses / r.totalClasses) * 100) : 0,
  }));

  const plans = await StudyPlan.find({ studentId });
  const planIds = plans.map(p => p._id);
  const allTasks = planIds.length > 0 ? await StudyTask.find({ studyPlanId: { $in: planIds } }) : [];
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const remainingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const sessions = await StudySession.find({ studentId, status: 'completed' });

  const todayMinutes = sessions
    .filter(s => s.endTime && s.endTime >= todayStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const weeklyMinutes = sessions
    .filter(s => s.endTime && s.endTime >= weekStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const monthlyMinutes = sessions
    .filter(s => s.endTime && s.endTime >= monthStart)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const activeSession = await StudySession.findOne({
    studentId,
    status: { $in: ['active', 'paused'] },
  });

  let currentSessionInfo = null;
  if (activeSession) {
    const elapsed = activeSession.durationMinutes;
    const task = activeSession.studyTaskId
      ? await StudyTask.findById(activeSession.studyTaskId)
      : null;
    const planned = task?.plannedMinutes || 0;
    currentSessionInfo = {
      elapsed: Math.round(elapsed * 100) / 100,
      remaining: Math.max(0, Math.round((planned - elapsed) * 100) / 100),
    };
  }

  const allSessionDurations = sessions.map(s => s.durationMinutes);
  const longestSession = allSessionDurations.length > 0 ? Math.max(...allSessionDurations) : 0;
  const averageSessionLength = allSessionDurations.length > 0
    ? Math.round((allSessionDurations.reduce((a, b) => a + b, 0) / allSessionDurations.length) * 100) / 100
    : 0;

  const sessionDates = [...new Set(
    sessions
      .filter(s => s.endTime)
      .map(s => {
        const d = new Date(s.endTime!);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  )];
  let streak = 0;
  const checkDate = new Date(now);
  while (sessionDates.includes(`${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    studyHoursData,
    focusData,
    subjectPerformance,
    totalStudyHours: Math.round(progress.reduce((sum, p) => sum + p.actualMinutes / 60, 0) * 10) / 10,
    averageFocusScore: progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.focusScore, 0) / progress.length * 10) / 10
      : 0,
    totalTasks: allTasks.length,
    completedTasks,
    remainingTasks,
    taskCompletionRate: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
    todayStudyMinutes: Math.round(todayMinutes * 100) / 100,
    weeklyStudyMinutes: Math.round(weeklyMinutes * 100) / 100,
    monthlyStudyMinutes: Math.round(monthlyMinutes * 100) / 100,
    currentSession: currentSessionInfo,
    studyStreak: streak,
    longestSession: Math.round(longestSession * 100) / 100,
    averageSessionLength,
  };
};

export const getStudentProgressData = async (userId: string) => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student profile not found');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Gather data in parallel
  const [sessions, allPlans, assignments, exams, academicRecords, progressEntries] = await Promise.all([
    StudySession.find({ studentId: student._id }).sort({ startTime: -1 }),
    StudyPlan.find({ studentId: student._id }),
    Assignment.find({ studentId: student._id }).sort({ createdAt: -1 }),
    Exam.find({ studentId: student._id }).sort({ examDate: 1 }),
    AcademicRecord.find({ studentId: student._id }).sort({ createdAt: -1 }),
    StudyProgress.find({ studentId: student._id }).sort({ completedAt: -1 }),
  ]);

  const todaySessions = sessions.filter(s => s.startTime >= todayStart);
  const weekSessions = sessions.filter(s => s.startTime >= weekStart);
  const monthSessions = sessions.filter(s => s.startTime >= monthStart);

  const totalStudyMinutes = Math.round(sessions.reduce((sum, s) => sum + s.durationMinutes, 0));
  const todayMinutes = Math.round(todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0));
  const weekMinutes = Math.round(weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0));
  const monthMinutes = Math.round(monthSessions.reduce((sum, s) => sum + s.durationMinutes, 0));

  const avgFocusScore = progressEntries.length > 0
    ? Math.round(progressEntries.reduce((sum, p) => sum + p.focusScore, 0) / progressEntries.length * 10) / 10
    : 0;

  // Study tasks (query tasks linked to student's plans)
  const planIds = allPlans.map(p => p._id);
  const studyTasks = await StudyTask.find({ studyPlanId: { $in: planIds } });
  const totalTasks = studyTasks.length;
  const completedTasks = studyTasks.filter(t => t.status === 'completed').length;

  // Assignments
  const submittedAssignments = assignments.filter(a => a.submitted);
  const avgAssignmentScore = assignments.length > 0
    ? Math.round(assignments.reduce((sum, a) => sum + (a.marks || 0), 0) / assignments.length * 10) / 10
    : 0;

  // Exams
  const upcomingExams = exams.filter(e => new Date(e.examDate) >= now);
  const completedExams = exams.filter(e => e.preparationLevel >= 100);
  const avgExamScore = exams.length > 0
    ? Math.round(exams.reduce((sum, e) => sum + (e.preparationLevel || 0), 0) / exams.length * 10) / 10
    : 0;

  // Academic records -> GPA
  const performanceByTerm: Array<{ term: string; gpa: number }> = [];
  let cumulativeGpa = 0;
  academicRecords.forEach((r) => {
    const gpa = r.grade ? (r.grade === 'A' ? 4 : r.grade === 'B' ? 3 : r.grade === 'C' ? 2 : r.grade === 'D' ? 1 : 0) : 0;
    performanceByTerm.push({ term: r.term, gpa });
    cumulativeGpa += gpa;
  });
  const avgGpa = academicRecords.length > 0
    ? Math.round(cumulativeGpa / academicRecords.length * 100) / 100
    : 0;

  // Recent sessions (last 30)
  const recentSessions = sessions.slice(0, 30).map(s => ({
    id: s._id,
    date: s.startTime,
    durationMinutes: s.durationMinutes,
    status: s.status,
    studyTaskId: s.studyTaskId,
  }));

  // Streak
  const studyStreak = calculateStreak(sessions);

  // Achievements
  const achievements = [
    { title: 'First Study Session', description: 'Complete your first study session', earned: sessions.length > 0, earnedAt: sessions.length > 0 ? sessions[sessions.length - 1]?.startTime?.toISOString() : undefined },
    { title: '7-Day Streak', description: 'Study for 7 consecutive days', earned: studyStreak >= 7, earnedAt: undefined },
    { title: '30-Day Streak', description: 'Study for 30 consecutive days', earned: studyStreak >= 30, earnedAt: undefined },
    { title: 'Task Master', description: 'Complete 10 study tasks', earned: completedTasks >= 10, earnedAt: undefined },
    { title: 'Exam Ready', description: 'Complete preparation for 5 exams', earned: completedExams.length >= 5, earnedAt: undefined },
    { title: '10 Hours', description: 'Accumulate 10 hours of study time', earned: totalStudyMinutes >= 600, earnedAt: undefined },
    { title: '50 Hours', description: 'Accumulate 50 hours of study time', earned: totalStudyMinutes >= 3000, earnedAt: undefined },
    { title: 'Focus Zone', description: 'Achieve average focus score >= 8', earned: avgFocusScore >= 8, earnedAt: undefined },
  ];

  // Daily data (last 30 days)
  const dailyData: Array<{ date: string; minutes: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const daySessions = sessions.filter(s => {
      const sDate = new Date(s.startTime);
      return sDate.getFullYear() === d.getFullYear() && sDate.getMonth() === d.getMonth() && sDate.getDate() === d.getDate();
    });
    dailyData.push({
      date: d.toISOString().split('T')[0],
      minutes: Math.round(daySessions.reduce((sum, s) => sum + s.durationMinutes, 0)),
    });
  }

  // Weekly data
  const weeklyData: Array<{ week: string; minutes: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const wStart = new Date(todayStart);
    wStart.setDate(wStart.getDate() - (wStart.getDay() + i * 7));
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 6);
    const wSessions = sessions.filter(s => s.startTime >= wStart && s.startTime <= wEnd);
    weeklyData.push({
      week: wStart.toISOString().split('T')[0],
      minutes: Math.round(wSessions.reduce((sum, s) => sum + s.durationMinutes, 0)),
    });
  }

  return {
    totalStudyHours: Math.round(totalStudyMinutes / 60 * 10) / 10,
    todayMinutes,
    weekMinutes,
    monthMinutes,
    avgFocusScore,
    totalTasks,
    completedTasks,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    submittedAssignments: submittedAssignments.length,
    avgAssignmentScore,
    upcomingExams: upcomingExams.length,
    completedExams: completedExams.length,
    avgExamScore,
    avgGpa,
    studyStreak,
    assignments: assignments.map(a => ({
      id: a._id,
      title: a.title,
      submitted: a.submitted,
      marks: a.marks,
      submittedAt: a.submittedAt,
    })),
    exams: exams.map(e => ({
      id: e._id,
      subjectName: e.subjectName,
      examDate: e.examDate,
      preparationLevel: e.preparationLevel,
      status: new Date(e.examDate) >= now ? 'upcoming' : 'completed',
    })),
    performanceByTerm,
    recentSessions,
    achievements,
    charts: { daily: dailyData, weekly: weeklyData },
  };
};

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map(s => {
    const d = new Date(s.startTime);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))].sort().reverse();
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
