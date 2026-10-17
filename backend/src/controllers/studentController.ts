import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as studentService from '../services/studentService';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await studentService.getProfile(req.user?.userId || '');
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await studentService.updateProfile(req.user?.userId || '', req.body);
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    res.status(400).json({ message });
  }
};

export const getStudyPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await studentService.getStudyPlans(req.user?.userId || '');
    res.status(200).json(plans);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get study plans';
    res.status(500).json({ message });
  }
};

export const createStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await studentService.createStudyPlan(req.user?.userId || '', req.body);
    res.status(201).json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create study plan';
    res.status(400).json({ message });
  }
};

export const updateStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await studentService.updateStudyPlan(
      req.params.id,
      req.user?.userId || '',
      req.body
    );
    if (!plan) {
      res.status(404).json({ message: 'Study plan not found' });
      return;
    }
    res.status(200).json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update study plan';
    res.status(400).json({ message });
  }
};

export const deleteStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await studentService.deleteStudyPlan(req.params.id, req.user?.userId || '');
    if (!plan) {
      res.status(404).json({ message: 'Study plan not found' });
      return;
    }
    res.status(200).json({ message: 'Study plan deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete study plan';
    res.status(400).json({ message });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await studentService.getTasks(req.user?.userId || '');
    res.status(200).json(tasks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get tasks';
    res.status(500).json({ message });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await studentService.createTask(req.user?.userId || '', req.body);
    res.status(201).json(task);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    res.status(400).json({ message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await studentService.updateTask(
      req.params.id,
      req.user?.userId || '',
      req.body
    );
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    res.status(400).json({ message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await studentService.deleteTask(req.params.id, req.user?.userId || '');
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    res.status(400).json({ message });
  }
};

export const logProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await studentService.logProgress(req.user?.userId || '', req.body);
    res.status(201).json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log progress';
    res.status(400).json({ message });
  }
};

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await studentService.getProgress(req.user?.userId || '');
    res.status(200).json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get progress';
    res.status(500).json({ message });
  }
};

export const getExams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exams = await studentService.getExams(req.user?.userId || '');
    res.status(200).json(exams);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get exams';
    res.status(500).json({ message });
  }
};

export const addExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await studentService.addExam(req.user?.userId || '', req.body);
    res.status(201).json(exam);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add exam';
    res.status(400).json({ message });
  }
};

export const updateExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await studentService.updateExam(
      req.params.id,
      req.user?.userId || '',
      req.body
    );
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }
    res.status(200).json(exam);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update exam';
    res.status(400).json({ message });
  }
};

export const getAcademicRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await studentService.getAcademicRecords(req.user?.userId || '');
    res.status(200).json(records);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get academic records';
    res.status(500).json({ message });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignments = await studentService.getAssignments(req.user?.userId || '');
    res.status(200).json(assignments);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get assignments';
    res.status(500).json({ message });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await studentService.submitAssignment(
      req.user?.userId || '',
      req.params.id,
      req.body.studentAnswer
    );
    res.status(200).json(assignment);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit assignment';
    res.status(400).json({ message });
  }
};
