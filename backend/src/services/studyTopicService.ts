import mongoose from 'mongoose';
import { StudyTopic, IStudyTopic } from '../models/StudyTopic';
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
  studyTaskId: string,
  userId: string
): Promise<mongoose.Types.ObjectId> => {
  const studentId = await resolveStudentId(userId);
  const task = await StudyTask.findById(studyTaskId);
  if (!task) throw new Error('Study task not found');
  const plan = await StudyPlan.exists({ _id: task.studyPlanId, studentId });
  if (!plan) throw new Error('Study task not found or unauthorized');
  return studentId;
};

const assertTopicOwned = async (topicId: string, userId: string) => {
  const studentId = await resolveStudentId(userId);
  const topic = await StudyTopic.findById(topicId);
  if (!topic) throw new Error('Topic not found');
  const task = await StudyTask.findById(topic.studyTaskId);
  const plan = task
    ? await StudyPlan.exists({ _id: task.studyPlanId, studentId })
    : false;
  if (!plan) throw new Error('Topic not found or unauthorized');
  return topic;
};

export const recalculateTask = async (taskId: string) => {
  const topics = await StudyTopic.find({ studyTaskId: taskId });
  const task = await StudyTask.findById(taskId);
  if (!task) return;

  const wasCompleted = task.status === 'completed';

  task.plannedMinutes = topics.reduce((sum, t) => sum + t.plannedMinutes, 0);
  task.studiedMinutes = topics.reduce((sum, t) => sum + t.studiedMinutes, 0);
  task.remainingMinutes = Math.max(0, task.plannedMinutes - task.studiedMinutes);
  task.progressPercentage =
    task.plannedMinutes > 0
      ? Math.min(100, Math.round((task.studiedMinutes / task.plannedMinutes) * 100))
      : 0;

  const allCompleted = topics.length > 0 && topics.every((t) => t.status === 'completed');
  const anyInProgress = topics.some((t) => t.status === 'in_progress');

  if (allCompleted) {
    task.status = 'completed';
    if (!wasCompleted) task.completedAt = new Date();
    task.remainingMinutes = 0;
    task.progressPercentage = 100;
  } else if (anyInProgress) {
    task.status = 'in_progress';
  } else {
    task.status = 'pending';
  }

  await task.save();

  if (allCompleted && !wasCompleted) {
    try {
      const plan = await StudyPlan.findById(task.studyPlanId);
      const student = plan ? await Student.findById(plan.studentId) : null;
      const targetUserId = student?.userId;
      if (targetUserId) {
        await Notification.create({
          userId: targetUserId,
          title: 'Study Goal Completed',
          message: 'Congratulations! You completed today\'s study goal.',
          type: 'success',
        });
      }
    } catch {
      // notification is optional
    }
  }

  return task;
};

export const createTopics = async (
  userId: string,
  studyTaskId: string,
  topics: Array<{ topicName: string; plannedMinutes: number }>
): Promise<IStudyTopic[]> => {
  await assertTaskOwned(studyTaskId, userId);

  const created = await StudyTopic.insertMany(
    topics.map((t) => ({
      studyTaskId,
      topicName: t.topicName,
      plannedMinutes: t.plannedMinutes,
      remainingMinutes: t.plannedMinutes,
    }))
  );

  await recalculateTask(studyTaskId);

  return created as unknown as IStudyTopic[];
};

export const getTopicsByTask = async (
  userId: string,
  taskId: string
): Promise<IStudyTopic[]> => {
  await assertTaskOwned(taskId, userId);
  return StudyTopic.find({ studyTaskId: taskId }).sort({ createdAt: 1 });
};

export const getTopic = async (
  userId: string,
  id: string
): Promise<IStudyTopic | null> => {
  return assertTopicOwned(id, userId);
};

export const updateTopic = async (
  userId: string,
  id: string,
  data: Partial<Pick<IStudyTopic, 'topicName' | 'plannedMinutes' | 'studiedMinutes' | 'status'>>
): Promise<IStudyTopic | null> => {
  const topic = await assertTopicOwned(id, userId);

  if (data.topicName !== undefined) topic.topicName = data.topicName;
  if (data.plannedMinutes !== undefined) topic.plannedMinutes = data.plannedMinutes;
  if (data.studiedMinutes !== undefined) topic.studiedMinutes = data.studiedMinutes;
  if (data.status !== undefined) topic.status = data.status;

  topic.remainingMinutes = Math.max(0, topic.plannedMinutes - topic.studiedMinutes);
  topic.progressPercentage =
    topic.plannedMinutes > 0
      ? Math.min(100, Math.round((topic.studiedMinutes / topic.plannedMinutes) * 100))
      : 0;

  if (topic.studiedMinutes >= topic.plannedMinutes && topic.status !== 'completed') {
    topic.status = 'completed';
    topic.completedAt = new Date();
    topic.remainingMinutes = 0;
    topic.progressPercentage = 100;
  }

  await topic.save();
  await recalculateTask(topic.studyTaskId.toString());

  return topic;
};

export const deleteTopic = async (userId: string, id: string): Promise<void> => {
  const topic = await assertTopicOwned(id, userId);

  const taskId = topic.studyTaskId.toString();
  await StudyTopic.findByIdAndDelete(id);
  await recalculateTask(taskId);
};

export const accumulateTopicTime = async (
  topicId: string,
  durationMinutes: number
): Promise<IStudyTopic> => {
  const topic = await StudyTopic.findById(topicId);
  if (!topic) throw new Error('Topic not found');

  topic.studiedMinutes = Math.round((topic.studiedMinutes + durationMinutes) * 100) / 100;
  topic.remainingMinutes = Math.max(0, topic.plannedMinutes - topic.studiedMinutes);
  topic.progressPercentage =
    topic.plannedMinutes > 0
      ? Math.min(100, Math.round((topic.studiedMinutes / topic.plannedMinutes) * 100))
      : 0;

  if (topic.studiedMinutes >= topic.plannedMinutes && topic.status !== 'completed') {
    topic.status = 'completed';
    topic.completedAt = new Date();
    topic.remainingMinutes = 0;
    topic.progressPercentage = 100;
  } else if (topic.status === 'pending') {
    topic.status = 'in_progress';
  }

  await topic.save();
  await recalculateTask(topic.studyTaskId.toString());

  return topic;
};
