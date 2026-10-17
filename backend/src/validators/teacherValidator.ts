import { z } from 'zod';

export const academicRecordSchema = z
  .object({
    studentId: z.string().min(1, 'Student ID is required'),
    subjectName: z.string().min(1, 'Subject name is required'),
    term: z.string().min(1, 'Term is required'),
    totalClasses: z.number().min(0, 'Total classes must be at least 0'),
    attendedClasses: z.number().min(0, 'Attended classes must be at least 0'),
    score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
    grade: z.string().min(1, 'Grade is required'),
    teacherNotes: z.string().optional(),
  })
  .refine((data) => data.attendedClasses <= data.totalClasses, {
    message: 'Attended classes cannot exceed total classes',
    path: ['attendedClasses'],
  });

export const updateAcademicRecordSchema = z
  .object({
    subjectName: z.string().min(1).optional(),
    term: z.string().min(1).optional(),
    totalClasses: z.number().min(0).optional(),
    attendedClasses: z.number().min(0).optional(),
    score: z.number().min(0).max(100).optional(),
    grade: z.string().min(1).optional(),
    teacherNotes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.totalClasses === undefined ||
      data.attendedClasses === undefined ||
      data.attendedClasses <= data.totalClasses,
    {
      message: 'Attended classes cannot exceed total classes',
      path: ['attendedClasses'],
    }
  );

export const subjectTopicSchema = z.object({
  academicRecordId: z.string().min(1, 'Academic record ID is required'),
  topicName: z.string().min(1, 'Topic name is required'),
  rating: z.enum(['excellent', 'good', 'average', 'needs_improvement']).default('average'),
  remarks: z.string().optional(),
});

export const updateSubjectTopicSchema = z.object({
  topicName: z.string().min(1).optional(),
  rating: z.enum(['excellent', 'good', 'average', 'needs_improvement']).optional(),
  remarks: z.string().optional(),
});

export const assignmentSchema = z.object({
  academicRecordId: z.string().min(1, 'Academic record ID is required'),
  title: z.string().min(1, 'Title is required'),
  dueDate: z.string().transform((str) => new Date(str)),
  marks: z.number().min(0, 'Marks must be at least 0'),
});

export const bulkAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subjectName: z.string().min(1, 'Subject name is required'),
  dueDate: z.string().transform((str) => new Date(str)),
  marks: z.number().min(0, 'Marks must be at least 0'),
  studentIds: z.array(z.string()).min(1, 'At least one student is required'),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  marks: z.number().min(0).optional(),
  submitted: z.boolean().optional(),
});

export type AcademicRecordInput = z.infer<typeof academicRecordSchema>;
export type UpdateAcademicRecordInput = z.infer<typeof updateAcademicRecordSchema>;
export type SubjectTopicInput = z.infer<typeof subjectTopicSchema>;
export type UpdateSubjectTopicInput = z.infer<typeof updateSubjectTopicSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type BulkAssignmentInput = z.infer<typeof bulkAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
