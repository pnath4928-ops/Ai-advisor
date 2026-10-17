import mongoose from 'mongoose';
import { AcademicRecord, IAcademicRecord } from '../models/AcademicRecord';
import { SubjectTopic, ISubjectTopic } from '../models/SubjectTopic';
import { Assignment, IAssignment } from '../models/Assignment';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import {
  AcademicRecordInput,
  UpdateAcademicRecordInput,
  SubjectTopicInput,
  UpdateSubjectTopicInput,
  AssignmentInput,
  BulkAssignmentInput,
  UpdateAssignmentInput,
} from '../validators/teacherValidator';

const resolveTeacherId = async (userId: string): Promise<mongoose.Types.ObjectId> => {
  const teacher = await Teacher.findOne({ userId });
  if (!teacher) throw new Error('Teacher not found');
  return teacher._id as mongoose.Types.ObjectId;
};

export const getStudents = async (userId: string) => {
  const teacher = await Teacher.findOne({ userId });
  if (!teacher) throw new Error('Teacher not found');

  const assigned = teacher.assignedClasses ?? [];
  const filter =
    assigned.length > 0
      ? {
          $or: [
            { gradeLevel: { $in: assigned } },
            { section: { $in: assigned } },
          ],
        }
      : {};

  const students = await Student.find(filter).populate('userId', 'name email');

  return students;
};

export const addAcademicRecord = async (
  userId: string,
  data: AcademicRecordInput
): Promise<IAcademicRecord> => {
  const teacherId = await resolveTeacherId(userId);
  return AcademicRecord.create({
    ...data,
    teacherId,
  });
};

export const updateAcademicRecord = async (
  id: string,
  userId: string,
  data: UpdateAcademicRecordInput
): Promise<IAcademicRecord | null> => {
  const teacherId = await resolveTeacherId(userId);
  return AcademicRecord.findOneAndUpdate(
    { _id: id, teacherId },
    data,
    { new: true }
  );
};

export const getAcademicRecords = async (userId: string): Promise<IAcademicRecord[]> => {
  const teacherId = await resolveTeacherId(userId);
  return AcademicRecord.find({ teacherId })
    .populate('studentId', 'studentId gradeLevel')
    .sort({ createdAt: -1 });
};

export const addSubjectTopic = async (
  userId: string,
  data: SubjectTopicInput
): Promise<ISubjectTopic> => {
  const teacherId = await resolveTeacherId(userId);
  const record = await AcademicRecord.findOne({ _id: data.academicRecordId, teacherId });
  if (!record) throw new Error('Academic record not found');

  return SubjectTopic.create(data);
};

export const updateSubjectTopic = async (
  id: string,
  userId: string,
  data: UpdateSubjectTopicInput
): Promise<ISubjectTopic | null> => {
  const teacherId = await resolveTeacherId(userId);
  const topic = await SubjectTopic.findById(id).populate('academicRecordId');
  if (!topic) return null;

  const recordRef = topic.academicRecordId as { _id?: mongoose.Types.ObjectId } | mongoose.Types.ObjectId | null;
  if (!recordRef) return null;
  const recordId = recordRef instanceof mongoose.Types.ObjectId ? recordRef : recordRef._id;
  const record = await AcademicRecord.findOne({ _id: recordId, teacherId });
  if (!record) return null;

  return SubjectTopic.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSubjectTopic = async (
  id: string,
  userId: string
): Promise<ISubjectTopic | null> => {
  const teacherId = await resolveTeacherId(userId);
  const topic = await SubjectTopic.findById(id).populate('academicRecordId');
  if (!topic) return null;

  const recordRef = topic.academicRecordId as { _id?: mongoose.Types.ObjectId } | mongoose.Types.ObjectId | null;
  if (!recordRef) return null;
  const recordId = recordRef instanceof mongoose.Types.ObjectId ? recordRef : recordRef._id;
  const record = await AcademicRecord.findOne({ _id: recordId, teacherId });
  if (!record) return null;

  return SubjectTopic.findByIdAndDelete(id);
};

export const getSubjectTopics = async (userId: string): Promise<ISubjectTopic[]> => {
  const teacherId = await resolveTeacherId(userId);
  const records = await AcademicRecord.find({ teacherId }).select('_id');
  const recordIds = records.map((r) => r._id);
  return SubjectTopic.find({ academicRecordId: { $in: recordIds } })
    .populate('academicRecordId', 'subjectName studentId')
    .sort({ createdAt: -1 });
};

export const createAssignment = async (
  userId: string,
  data: AssignmentInput
): Promise<IAssignment> => {
  const teacherId = await resolveTeacherId(userId);
  const record = await AcademicRecord.findOne({ _id: data.academicRecordId, teacherId });
  if (!record) throw new Error('Academic record not found');

  return Assignment.create({
    ...data,
    teacherId,
    subjectName: record.subjectName,
    studentId: record.studentId,
  });
};

export const createBulkAssignments = async (
  userId: string,
  data: BulkAssignmentInput
): Promise<IAssignment[]> => {
  const teacherId = await resolveTeacherId(userId);

  const assignments = await Assignment.insertMany(
    data.studentIds.map((studentId) => ({
      teacherId,
      studentId,
      title: data.title,
      description: data.description,
      subjectName: data.subjectName,
      dueDate: data.dueDate,
      marks: data.marks,
      submitted: false,
    }))
  );

  return assignments as unknown as IAssignment[];
};

export const updateAssignment = async (
  id: string,
  userId: string,
  data: UpdateAssignmentInput
): Promise<IAssignment | null> => {
  const teacherId = await resolveTeacherId(userId);
  const assignment = await Assignment.findById(id);
  if (!assignment) return null;
  if (assignment.teacherId.toString() !== teacherId.toString()) return null;

  return Assignment.findByIdAndUpdate(id, data, { new: true });
};

export const getAssignments = async (userId: string): Promise<IAssignment[]> => {
  const teacherId = await resolveTeacherId(userId);
  return Assignment.find({ teacherId })
    .populate('studentId', 'studentId gradeLevel')
    .sort({ dueDate: 1 });
};
