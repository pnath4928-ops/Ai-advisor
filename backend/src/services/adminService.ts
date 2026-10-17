import { User, IUser } from '../models/User';
import { Student, IStudent } from '../models/Student';
import { Teacher, ITeacher } from '../models/Teacher';
import { AcademicRecord } from '../models/AcademicRecord';
import { StudyPlan } from '../models/StudyPlan';
import { StudyTask } from '../models/StudyTask';
import { StudyTopic } from '../models/StudyTopic';
import { StudyProgress } from '../models/StudyProgress';
import { StudySession } from '../models/StudySession';
import { SubjectTopic } from '../models/SubjectTopic';
import { Assignment } from '../models/Assignment';
import { Exam } from '../models/Exam';
import { Notification } from '../models/Notification';
import { AISuggestion } from '../models/AISuggestion';
import { escapeRegex } from '../utils/escapeRegex';

export const getAllUsers = async (filters?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: Omit<IUser, 'password'>[]; total: number; page: number; totalPages: number }> => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (filters?.role) query.role = filters.role;
  if (filters?.search) {
    const escaped = escapeRegex(filters.search);
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).select('-password');
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
}): Promise<Omit<IUser, 'password'>> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('Email already exists');

  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const created = await User.create({ ...data, password: hashedPassword });
  const safe = created.toObject();
  delete (safe as { password?: string }).password;
  return safe as unknown as Omit<IUser, 'password'>;
};

export const updateUser = async (id: string, data: {
  name?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
}): Promise<IUser | null> => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

export const deleteUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) return null;

  await Notification.deleteMany({ userId: user._id });

  const student = await Student.findOne({ userId: user._id });
  if (student) {
    const plans = await StudyPlan.find({ studentId: student._id }).select('_id');
    const planIds = plans.map((p) => p._id);
    if (planIds.length) {
      const tasks = await StudyTask.find({ studyPlanId: { $in: planIds } }).select('_id');
      const taskIds = tasks.map((t) => t._id);
      if (taskIds.length) {
        await StudyTopic.deleteMany({ studyTaskId: { $in: taskIds } });
        await StudyTask.deleteMany({ _id: { $in: taskIds } });
      }
      await AISuggestion.deleteMany({ studyPlanId: { $in: planIds } });
      await StudyPlan.deleteMany({ _id: { $in: planIds } });
    }
    await StudyProgress.deleteMany({ studentId: student._id });
    await StudySession.deleteMany({ studentId: student._id });
    await Exam.deleteMany({ studentId: student._id });
    await Assignment.deleteMany({ studentId: student._id });

    const studentRecords = await AcademicRecord.find({ studentId: student._id }).select('_id');
    const studentRecordIds = studentRecords.map((r) => r._id);
    if (studentRecordIds.length) {
      await SubjectTopic.deleteMany({ academicRecordId: { $in: studentRecordIds } });
      await Assignment.deleteMany({ academicRecordId: { $in: studentRecordIds } });
      await AcademicRecord.deleteMany({ _id: { $in: studentRecordIds } });
    }
    await Student.deleteOne({ _id: student._id });
  }

  const teacher = await Teacher.findOne({ userId: user._id });
  if (teacher) {
    await Assignment.deleteMany({ teacherId: teacher._id });
    const teacherRecords = await AcademicRecord.find({ teacherId: teacher._id }).select('_id');
    const teacherRecordIds = teacherRecords.map((r) => r._id);
    if (teacherRecordIds.length) {
      await SubjectTopic.deleteMany({ academicRecordId: { $in: teacherRecordIds } });
      await Assignment.deleteMany({ academicRecordId: { $in: teacherRecordIds } });
      await AcademicRecord.deleteMany({ _id: { $in: teacherRecordIds } });
    }
    await Teacher.deleteOne({ _id: teacher._id });
  }

  return User.findByIdAndDelete(id);
};

export const getAllTeachers = async (filters?: {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<{ teachers: ITeacher[]; total: number; page: number; totalPages: number }> => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (filters?.department) query.department = filters.department;
  if (filters?.search) {
    const escaped = escapeRegex(filters.search);
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ],
    }).select('_id');
    query.$or = [
      { teacherId: { $regex: escaped, $options: 'i' } },
      { department: { $regex: escaped, $options: 'i' } },
      { userId: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Teacher.countDocuments(query),
  ]);

  return { teachers, total, page, totalPages: Math.ceil(total / limit) };
};

export const createTeacher = async (data: {
  userId: string;
  teacherId: string;
  department: string;
  designation: string;
  assignedSubjects: string[];
  assignedClasses: string[];
}): Promise<ITeacher> => {
  const existing = await Teacher.findOne({ userId: data.userId });
  if (existing) throw new Error('Teacher profile already exists for this user');
  return Teacher.create(data);
};

export const updateTeacher = async (id: string, data: Partial<{
  department: string;
  designation: string;
  assignedSubjects: string[];
  assignedClasses: string[];
}>): Promise<ITeacher | null> => {
  return Teacher.findByIdAndUpdate(id, data, { new: true });
};

export const getAllStudents = async (filters?: {
  search?: string;
  gradeLevel?: string;
  section?: string;
  page?: number;
  limit?: number;
}): Promise<{ students: IStudent[]; total: number; page: number; totalPages: number }> => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (filters?.gradeLevel) query.gradeLevel = filters.gradeLevel;
  if (filters?.section) query.section = filters.section;
  if (filters?.search) {
    const escaped = escapeRegex(filters.search);
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ],
    }).select('_id');
    query.$or = [
      { studentId: { $regex: escaped, $options: 'i' } },
      { userId: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(query),
  ]);

  return { students, total, page, totalPages: Math.ceil(total / limit) };
};

export const createStudent = async (data: {
  userId: string;
  studentId: string;
  gradeLevel: string;
  section: string;
  learningPreference: string;
  preferredStudyTime: string;
  preferredStudyTechnique: string;
  academicGoal: string;
}): Promise<IStudent> => {
  const existing = await Student.findOne({ userId: data.userId });
  if (existing) throw new Error('Student profile already exists for this user');
  return Student.create(data);
};

export const updateStudent = async (id: string, data: Partial<{
  gradeLevel: string;
  section: string;
  learningPreference: string;
  preferredStudyTime: string;
  preferredStudyTechnique: string;
  academicGoal: string;
}>): Promise<IStudent | null> => {
  return Student.findByIdAndUpdate(id, data, { new: true });
};

export const getSystemStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAcademicRecords,
    totalStudyPlans,
    totalAISuggestions,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments(),
    Student.countDocuments(),
    Teacher.countDocuments(),
    AcademicRecord.countDocuments(),
    StudyPlan.countDocuments(),
    AISuggestion.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAcademicRecords,
    totalStudyPlans,
    totalAISuggestions,
    usersByRole: usersByRole.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, {} as Record<string, number>),
  };
};
