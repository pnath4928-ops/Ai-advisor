import { z } from 'zod';

export const startSessionSchema = z.object({
  studyTaskId: z.string().min(1, 'Study task ID is required'),
  studyTopicId: z.string().optional(),
});

export const pauseSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const resumeSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const endSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type PauseSessionInput = z.infer<typeof pauseSessionSchema>;
export type ResumeSessionInput = z.infer<typeof resumeSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
