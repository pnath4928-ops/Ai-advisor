import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  logProgress,
  getProgress,
  getExams,
  addExam,
  updateExam,
  getAcademicRecords,
  getAssignments,
  submitAssignment,
} from '../controllers/studentController';
import {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  getActiveSession,
  getSessionsByTask,
  getSessionTimers,
} from '../controllers/studySessionController';
import {
  createTopics,
  getTopicsByTask,
  getTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/studyTopicController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileSchema,
  studyPlanSchema,
  updateStudyPlanSchema,
  studyTaskSchema,
  updateStudyTaskSchema,
  studyProgressSchema,
  examSchema,
  updateExamSchema,
  submitAssignmentSchema,
} from '../validators/studentValidator';
import {
  startSessionSchema,
} from '../validators/studySessionValidator';
import {
  createTopicsSchema,
  updateTopicSchema,
} from '../validators/studyTopicValidator';

const router = Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);

router.get('/study-plans', getStudyPlans);
router.post('/study-plans', validate(studyPlanSchema), createStudyPlan);
router.put('/study-plans/:id', validate(updateStudyPlanSchema), updateStudyPlan);
router.delete('/study-plans/:id', deleteStudyPlan);

router.get('/tasks', getTasks);
router.post('/tasks', validate(studyTaskSchema), createTask);
router.put('/tasks/:id', validate(updateStudyTaskSchema), updateTask);
router.delete('/tasks/:id', deleteTask);

router.post('/progress', validate(studyProgressSchema), logProgress);
router.get('/progress', getProgress);

router.get('/exams', getExams);
router.post('/exams', validate(examSchema), addExam);
router.put('/exams/:id', validate(updateExamSchema), updateExam);

router.get('/academic-records', getAcademicRecords);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/submit', validate(submitAssignmentSchema), submitAssignment);

router.post('/sessions/start', validate(startSessionSchema), startSession);
router.post('/sessions/:id/pause', pauseSession);
router.post('/sessions/:id/resume', resumeSession);
router.post('/sessions/:id/end', endSession);
router.get('/sessions/active', getActiveSession);
router.get('/sessions/task/:taskId', getSessionsByTask);
router.get('/sessions/timers', getSessionTimers);

// Topic routes
router.post('/topics', validate(createTopicsSchema), createTopics);
router.get('/topics/task/:taskId', getTopicsByTask);
router.get('/topics/:id', getTopic);
router.put('/topics/:id', validate(updateTopicSchema), updateTopic);
router.delete('/topics/:id', deleteTopic);

export default router;
