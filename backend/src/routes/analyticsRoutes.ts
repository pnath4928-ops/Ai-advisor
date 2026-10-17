import { Router } from 'express';
import { getTeacherAnalytics, getStudentAnalytics, getStudentProgress } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/teacher', authorize('teacher'), getTeacherAnalytics);
router.get('/student', authorize('student'), getStudentAnalytics);
router.get('/student/progress', authorize('student'), getStudentProgress);

export default router;
