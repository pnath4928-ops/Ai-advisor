import { Router } from 'express';
import {
  generateSuggestion,
  generateFullPlan,
  analyzeWeakSubjects,
  revisionStrategy,
  getSuggestions,
  acceptSuggestion,
  rejectSuggestion,
  getAdvisor,
  askQuestion,
} from '../controllers/aiController';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const generateSchema = z.object({
  type: z.enum(['plan', 'daily', 'weakness', 'revision']),
});

const askSchema = z.object({
  question: z.string().min(1).max(2000),
  history: z
    .array(z.object({
      role: z.enum(['user', 'ai']),
      text: z.string().max(4000),
    }))
    .max(30)
    .optional(),
});

const generatePlanSchema = z.object({
  scope: z.enum(['day', 'week']).optional(),
});

const router = Router();

router.use(authenticate);
router.use(authorize('student'));

router.post('/generate', validate(generateSchema), generateSuggestion);
router.post('/generate-plan', validate(generatePlanSchema), generateFullPlan);
router.post('/weak-subjects', analyzeWeakSubjects);
router.post('/revision-strategy', revisionStrategy);
router.get('/suggestions', getSuggestions);
router.post('/suggestions/:id/accept', acceptSuggestion);
router.delete('/suggestions/:id/reject', rejectSuggestion);
router.get('/advisor', getAdvisor);
router.post('/ask', validate(askSchema), askQuestion);

export default router;
