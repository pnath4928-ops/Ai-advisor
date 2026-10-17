import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
});

export const createTeacherSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  assignedSubjects: z.array(z.string()).default([]),
  assignedClasses: z.array(z.string()).default([]),
});

export const updateTeacherSchema = z.object({
  department: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  assignedSubjects: z.array(z.string()).optional(),
  assignedClasses: z.array(z.string()).optional(),
});

export const createStudentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  section: z.string().min(1, 'Section is required'),
  learningPreference: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']),
  preferredStudyTime: z.string().min(1, 'Preferred study time is required'),
  preferredStudyTechnique: z.string().min(1, 'Preferred study technique is required'),
  academicGoal: z.string().min(1, 'Academic goal is required'),
});

export const updateStudentSchema = z.object({
  gradeLevel: z.string().min(1).optional(),
  section: z.string().min(1).optional(),
  learningPreference: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']).optional(),
  preferredStudyTime: z.string().min(1).optional(),
  preferredStudyTechnique: z.string().min(1).optional(),
  academicGoal: z.string().min(1).optional(),
});
