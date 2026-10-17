import { Router } from 'express';
import {
  getStudents,
  addAcademicRecord,
  updateAcademicRecord,
  getAcademicRecords,
  addSubjectTopic,
  updateSubjectTopic,
  deleteSubjectTopic,
  getSubjectTopics,
  createAssignment,
  createBulkAssignments,
  updateAssignment,
  getAssignments,
} from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  academicRecordSchema,
  updateAcademicRecordSchema,
  subjectTopicSchema,
  updateSubjectTopicSchema,
  assignmentSchema,
  bulkAssignmentSchema,
  updateAssignmentSchema,
} from '../validators/teacherValidator';

const router = Router();

router.use(authenticate);
router.use(authorize('teacher'));

router.get('/students', getStudents);

router.post('/academic-records', validate(academicRecordSchema), addAcademicRecord);
router.get('/academic-records', getAcademicRecords);
router.put('/academic-records/:id', validate(updateAcademicRecordSchema), updateAcademicRecord);

router.post('/subjects', validate(subjectTopicSchema), addSubjectTopic);
router.get('/subjects', getSubjectTopics);
router.put('/subjects/:id', validate(updateSubjectTopicSchema), updateSubjectTopic);
router.delete('/subjects/:id', deleteSubjectTopic);

router.post('/assignments', validate(assignmentSchema), createAssignment);
router.post('/assignments/bulk', validate(bulkAssignmentSchema), createBulkAssignments);
router.get('/assignments', getAssignments);
router.put('/assignments/:id', validate(updateAssignmentSchema), updateAssignment);

export default router;
