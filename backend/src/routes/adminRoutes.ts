import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as adminController from '../controllers/adminController';
import {
  createUserSchema,
  updateUserSchema,
  createTeacherSchema,
  updateTeacherSchema,
  createStudentSchema,
  updateStudentSchema,
} from '../validators/adminValidator';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.put('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/teachers', adminController.getAllTeachers);
router.post('/teachers', validate(createTeacherSchema), adminController.createTeacher);
router.put('/teachers/:id', validate(updateTeacherSchema), adminController.updateTeacher);

router.get('/students', adminController.getAllStudents);
router.post('/students', validate(createStudentSchema), adminController.createStudent);
router.put('/students/:id', validate(updateStudentSchema), adminController.updateStudent);

router.get('/stats', adminController.getSystemStats);

export default router;
