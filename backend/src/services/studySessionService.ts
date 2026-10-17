import mongoose from 'mongoose';
import { StudySession, IStudySession } from '../models/StudySession';
import { StudyTask } from '../models/StudyTask';
import { StudyPlan } from '../models/StudyPlan';
import { Student } from '../models/Student';
import { Notification } from '../models/Notification';

const resolveStudentId = async (userId: string): Promise<mongoose.Types.ObjectId> => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student not found');
  return student._id as mongoose.Types.ObjectId;
};

const assertTaskOwned = async (
  taskId: string,
  studentId: mongoose.Types.ObjectId
) => {
  const task = await StudyTask.findById(taskId);
  if (!task) throw new Error('Study task not found');
  const plan = await StudyPlan.exists({ _id: task.studyPlanId, studentId });
  if (!plan) throw new Error('Study task not found or unauthorized');
  return task;
};

const checkAndCompleteTask = async (taskId: string): Promise<boolean> => {
  const task = await StudyTask.findById(taskId);
  if (!task) return false;

  task.remainingMinutes = Math.max(0, task.plannedMinutes - task.studiedMinutes);
  task.progressPercentage =
    task.plannedMinutes > 0
      ? Math.min(100, Math.round((task.studiedMinutes / task.plannedMinutes) * 100))
      : 0;

  let justCompleted = false;
  if (task.plannedMinutes > 0 && task.studiedMinutes >= task.plannedMinutes && task.status !== 'completed') {
    task.status = 'completed';
    task.completedAt = new Date();
    task.remainingMinutes = 0;
    task.progressPercentage = 100;
    justCompleted = true;
  }

  await task.save();
  return justCompleted;
};

export const startSession = async (
  userId: string,
  studyTaskId: string,
  studyTopicId?: string
): Promise<IStudySession> => {
  const studentId = await resolveStudentId(userId);

  const activeSession = await StudySession.findOne({
    studentId,
    status: { $in: ['active', 'paused'] },
  });
  if (activeSession) {
    throw new Error('You already have an active study session. Please end or pause it first.');
  }

  const task = await assertTaskOwned(studyTaskId, studentId);
  if (task.status === 'completed') {
    throw new Error('This task is already completed');
  }

  if (task.status === 'pending') {
    task.status = 'in_progress';
    await task.save();
  }

  if (studyTopicId) {
    const { StudyTopic } = await import('../models/StudyTopic');
    const topic = await StudyTopic.findById(studyTopicId);
    if (topic && topic.status === 'pending') {
      topic.status = 'in_progress';
      await topic.save();
    }
  }

  const session = await StudySession.create({
    studentId,
    studyTaskId,
    studyTopicId,
    startTime: new Date(),
    status: 'active',
  });

  return session;
};

export const pauseSession = async (
  userId: string,
  sessionId: string
): Promise<IStudySession> => {
  const studentId = await resolveStudentId(userId);

  const session = await StudySession.findOne({ _id: sessionId, studentId });
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'active') {
    throw new Error('Session is not active');
  }

  const now = new Date();
  const segmentStart = session.resumedAt ?? session.startTime;
  session.durationMinutes += Math.max(0, now.getTime() - segmentStart.getTime()) / 60000;
  session.pausedAt = now;
  session.resumedAt = undefined;
  session.status = 'paused';
  await session.save();

  return session;
};

export const resumeSession = async (
  userId: string,
  sessionId: string
): Promise<IStudySession> => {
  const studentId = await resolveStudentId(userId);

  const session = await StudySession.findOne({ _id: sessionId, studentId });
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'paused') {
    throw new Error('Session is not paused');
  }

  session.resumedAt = new Date();
  session.pausedAt = undefined;
  session.status = 'active';
  await session.save();

  return session;
};

export const endSession = async (
  userId: string,
  sessionId: string
): Promise<{ session: IStudySession; taskCompleted: boolean }> => {
  const studentId = await resolveStudentId(userId);

  const session = await StudySession.findOne({ _id: sessionId, studentId });
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status === 'completed') {
    throw new Error('Session is already completed');
  }

  const now = new Date();
  if (session.status === 'active') {
    const segmentStart = session.resumedAt ?? session.startTime;
    session.durationMinutes += Math.max(0, now.getTime() - segmentStart.getTime()) / 60000;
  }

  session.endTime = now;
  session.status = 'completed';
  await session.save();

  let taskCompleted = false;

  if (session.studyTopicId) {
    const { accumulateTopicTime } = await import('../services/studyTopicService');
    await accumulateTopicTime(session.studyTopicId.toString(), session.durationMinutes);
    const task = await StudyTask.findById(session.studyTaskId);
    taskCompleted = !!task && task.status === 'completed';
    return { session, taskCompleted };
  }

  const task = await StudyTask.findById(session.studyTaskId);
  if (task) {
    task.studiedMinutes = Math.round((task.studiedMinutes + session.durationMinutes) * 100) / 100;

    if (task.status === 'pending') {
      task.status = 'in_progress';
    }

    await task.save();
    taskCompleted = await checkAndCompleteTask(task._id.toString());
  }

  if (taskCompleted) {
    try {
      await Notification.create({
        userId,
        title: 'Study Goal Completed',
        message: 'Congratulations! You completed today\'s study goal.',
        type: 'success',
      });
    } catch {
      // notification is optional
    }
  }

  return { session, taskCompleted };
};

export const getActiveSession = async (
  userId: string
): Promise<IStudySession | null> => {
  const studentId = await resolveStudentId(userId);
  return StudySession.findOne({
    studentId,
    status: { $in: ['active', 'paused'] },
  }).populate('studyTaskId');
};

export const getSessionsByTask = async (
  userId: string,
  studyTaskId: string
): Promise<IStudySession[]> => {
  const studentId = await resolveStudentId(userId);
  return StudySession.find({ studentId, studyTaskId }).sort({ startTime: 1 });
};

export const getSessionTimers = async (userId: string) => {
  const studentId = await resolveStudentId(userId);

  const activeSession = await StudySession.findOne({
    studentId,
    status: { $in: ['active', 'paused'] },
  }).populate('studyTaskId');

  if (!activeSession) {
    return { active: false };
  }

  const now = new Date();
  let elapsedMinutes = activeSession.durationMinutes;

  if (activeSession.status === 'active') {
    const segmentStart = activeSession.resumedAt ?? activeSession.startTime;
    elapsedMinutes += Math.max(0, now.getTime() - segmentStart.getTime()) / 60000;
  }

  const task = activeSession.studyTaskId as unknown as { plannedMinutes: number };
  const plannedMinutes = task?.plannedMinutes || 0;
  const remainingMinutes = Math.max(0, plannedMinutes - elapsedMinutes);
  const progressPercentage = plannedMinutes > 0
    ? Math.min(100, Math.round((elapsedMinutes / plannedMinutes) * 100))
    : 0;

  return {
    active: true,
    sessionId: activeSession._id,
    status: activeSession.status,
    startTime: activeSession.startTime,
    elapsedMinutes: Math.round(elapsedMinutes * 100) / 100,
    remainingMinutes: Math.round(remainingMinutes * 100) / 100,
    progressPercentage,
  };
};
