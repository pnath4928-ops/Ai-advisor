import { z } from 'zod';

export const createTopicsSchema = z.object({
  studyTaskId: z.string().min(1, 'Study task ID is required'),
  topics: z
    .array(
      z.object({
        topicName: z.string().min(1, 'Topic name is required'),
        plannedMinutes: z.number().min(1, 'Minimum 1 minute'),
      })
    )
    .min(1, 'At least one topic is required'),
});

export const updateTopicSchema = z.object({
  topicName: z.string().min(1).optional(),
  plannedMinutes: z.number().min(1).optional(),
  studiedMinutes: z.number().min(0).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

export type CreateTopicsInput = z.infer<typeof createTopicsSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
