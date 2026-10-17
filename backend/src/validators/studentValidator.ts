import { z } from 'zod';

export const updateProfileSchema = z.object({
  gradeLevel: z.string().optional(),
  section: z.string().optional(),
  learningPreference: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']).optional(),
  preferredStudyTime: z.string().optional(),
  preferredStudyTechnique: z.string().optional(),
  academicGoal: z.string().optional(),
});

export const studyPlanSchema = z.object({
  weekStartDate: z.string().transform((str) => new Date(str)),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
});

export const updateStudyPlanSchema = z.object({
  weekStartDate: z.string().transform((str) => new Date(str)).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

export const studyTaskSchema = z.object({
  studyPlanId: z.string().min(1, 'Study plan ID is required'),
  day: z.string().min(1, 'Day is required'),
  subjectName: z.string().min(1, 'Subject name is required'),
  plannedMinutes: z.number().min(1, 'Minimum 1 minute'),
  studyTechnique: z.string().min(1, 'Study technique is required'),
});

export const updateStudyTaskSchema = z.object({
  day: z.string().min(1).optional(),
  subjectName: z.string().min(1).optional(),
  plannedMinutes: z.number().min(1).optional(),
  studiedMinutes: z.number().min(0).optional(),
  remainingMinutes: z.number().min(0).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  studyTechnique: z.string().min(1).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  completedAt: z.string().optional(),
});

export const studyProgressSchema = z.object({
  studyTaskId: z.string().min(1, 'Study task ID is required'),
  actualMinutes: z.number().min(0, 'Minutes must be positive'),
  focusScore: z.number().min(0).max(10, 'Focus score must be between 0 and 10'),
  notes: z.string().optional(),
});

export const examSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  examType: z.string().min(1, 'Exam type is required'),
  examDate: z.string().transform((str) => new Date(str)),
  preparationLevel: z.number().min(0).max(100, 'Must be between 0 and 100'),
});

export const updateExamSchema = z.object({
  subjectName: z.string().min(1).optional(),
  examType: z.string().min(1).optional(),
  examDate: z.string().transform((str) => new Date(str)).optional(),
  preparationLevel: z.number().min(0).max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type StudyPlanInput = z.infer<typeof studyPlanSchema>;
export type UpdateStudyPlanInput = z.infer<typeof updateStudyPlanSchema>;
export type StudyTaskInput = z.infer<typeof studyTaskSchema>;
export type UpdateStudyTaskInput = z.infer<typeof updateStudyTaskSchema>;
export type StudyProgressInput = z.infer<typeof studyProgressSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export const submitAssignmentSchema = z.object({
  studentAnswer: z.string().min(1, 'Answer is required'),
});

export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
