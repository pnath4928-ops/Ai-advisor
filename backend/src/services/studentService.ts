import mongoose from 'mongoose';
import { Student, IStudent } from '../models/Student';
import { StudyPlan, IStudyPlan } from '../models/StudyPlan';
import { StudyTask, IStudyTask } from '../models/StudyTask';
import { StudyProgress, IStudyProgress } from '../models/StudyProgress';
import { Exam, IExam } from '../models/Exam';
import { AcademicRecord } from '../models/AcademicRecord';
import { Assignment } from '../models/Assignment';
import {
  UpdateProfileInput,
  StudyPlanInput,
  UpdateStudyPlanInput,
  StudyTaskInput,
  UpdateStudyTaskInput,
  StudyProgressInput,
  ExamInput,
  UpdateExamInput,
} from '../validators/studentValidator';

const resolveStudentId = async (userId: string): Promise<mongoose.Types.ObjectId> => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student not found');
  return student._id as mongoose.Types.ObjectId;
};

export const getProfile = async (userId: string): Promise<IStudent | null> => {
  return Student.findOne({ userId }).populate('userId', 'name email');
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<IStudent | null> => {
  return Student.findOneAndUpdate({ userId }, data, { new: true }).populate(
    'userId',
    'name email'
  );
};

export const getStudyPlans = async (userId: string): Promise<IStudyPlan[]> => {
  const studentId = await resolveStudentId(userId);
  return StudyPlan.find({ studentId }).sort({ createdAt: -1 });
};

export const createStudyPlan = async (
  userId: string,
  data: StudyPlanInput
): Promise<IStudyPlan> => {
  const studentId = await resolveStudentId(userId);
  return StudyPlan.create({
    ...data,
    studentId,
  });
};

export const updateStudyPlan = async (
  id: string,
  userId: string,
  data: UpdateStudyPlanInput
): Promise<IStudyPlan | null> => {
  const studentId = await resolveStudentId(userId);
  return StudyPlan.findOneAndUpdate(
    { _id: id, studentId },
    data,
    { new: true }
  );
};

export const deleteStudyPlan = async (
  id: string,
  userId: string
): Promise<IStudyPlan | null> => {
  const studentId = await resolveStudentId(userId);
  const tasks = await StudyTask.find({ studyPlanId: id }).select('_id');
  const taskIds = tasks.map((t) => t._id);
  const { StudyTopic } = await import('../models/StudyTopic');
  if (taskIds.length > 0) {
    await StudyTopic.deleteMany({ studyTaskId: { $in: taskIds } });
  }
  await StudyTask.deleteMany({ studyPlanId: id });
  return StudyPlan.findOneAndDelete({ _id: id, studentId });
};

export const getTasks = async (userId: string): Promise<IStudyTask[]> => {
  const studentId = await resolveStudentId(userId);
  const plans = await StudyPlan.find({ studentId }).select('_id');
  const planIds = plans.map((p) => p._id);
  return StudyTask.find({ studyPlanId: { $in: planIds } }).sort({ day: 1 });
};

export const createTask = async (
  userId: string,
  data: StudyTaskInput
): Promise<IStudyTask> => {
  const studentId = await resolveStudentId(userId);
  const plan = await StudyPlan.findOne({ _id: data.studyPlanId, studentId });
  if (!plan) throw new Error('Study plan not found or unauthorized');

  return StudyTask.create({
    ...data,
    remainingMinutes: data.plannedMinutes,
  });
};

export const updateTask = async (
  id: string,
  userId: string,
  data: UpdateStudyTaskInput
): Promise<IStudyTask | null> => {
  const studentId = await resolveStudentId(userId);
  const task = await StudyTask.findById(id);
  if (!task) return null;

  const plan = await StudyPlan.findOne({ _id: task.studyPlanId, studentId });
  if (!plan) return null;

  return StudyTask.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTask = async (id: string, userId: string): Promise<void> => {
  const studentId = await resolveStudentId(userId);
  const task = await StudyTask.findById(id);
  if (!task) throw new Error('Task not found');

  const plan = await StudyPlan.findOne({ _id: task.studyPlanId, studentId });
  if (!plan) throw new Error('Task not found or unauthorized');

  const { StudyTopic } = await import('../models/StudyTopic');
  await StudyTopic.deleteMany({ studyTaskId: task._id });
  await StudyTask.findByIdAndDelete(id);
};

export const logProgress = async (
  userId: string,
  data: StudyProgressInput
): Promise<IStudyProgress> => {
  const studentId = await resolveStudentId(userId);
  const progress = await StudyProgress.create({
    ...data,
    studentId,
    completedAt: new Date(),
  });

  return progress;
};

export const getProgress = async (userId: string): Promise<IStudyProgress[]> => {
  const studentId = await resolveStudentId(userId);
  return StudyProgress.find({ studentId })
    .populate('studyTaskId', 'subjectName')
    .sort({ completedAt: -1 });
};

export const getExams = async (userId: string): Promise<IExam[]> => {
  const studentId = await resolveStudentId(userId);
  return Exam.find({ studentId }).sort({ examDate: 1 });
};

export const addExam = async (
  userId: string,
  data: ExamInput
): Promise<IExam> => {
  const studentId = await resolveStudentId(userId);
  return Exam.create({
    ...data,
    studentId,
  });
};

export const updateExam = async (
  id: string,
  userId: string,
  data: UpdateExamInput
): Promise<IExam | null> => {
  const studentId = await resolveStudentId(userId);
  return Exam.findOneAndUpdate(
    { _id: id, studentId },
    data,
    { new: true }
  );
};

export const getAcademicRecords = async (userId: string) => {
  const studentId = await resolveStudentId(userId);
  return AcademicRecord.find({ studentId })
    .populate('teacherId', 'teacherId')
    .sort({ createdAt: -1 });
};

export const getAssignments = async (userId: string) => {
  const studentId = await resolveStudentId(userId);
  const records = await AcademicRecord.find({ studentId }).select('_id');
  const recordIds = records.map((r) => r._id);
  return Assignment.find({
    $or: [
      { academicRecordId: { $in: recordIds } },
      { studentId },
    ],
  }).sort({ dueDate: 1 });
};

export const submitAssignment = async (
  userId: string,
  assignmentId: string,
  studentAnswer: string
) => {
  const studentId = await resolveStudentId(userId);
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');
  if (assignment.submitted) throw new Error('Assignment already submitted');

  const studentOwns =
    assignment.studentId?.toString() === studentId.toString() ||
    (assignment.academicRecordId
      ? await AcademicRecord.exists({ _id: assignment.academicRecordId, studentId })
      : false);
  if (!studentOwns) throw new Error('Assignment not assigned to you');

  assignment.submitted = true;
  assignment.studentAnswer = studentAnswer;
  assignment.submittedAt = new Date();
  return assignment.save();
};
