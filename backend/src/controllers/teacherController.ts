import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as teacherService from '../services/teacherService';

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await teacherService.getStudents(req.user?.userId || '');
    res.status(200).json(students);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get students';
    res.status(500).json({ message });
  }
};

export const addAcademicRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await teacherService.addAcademicRecord(req.user?.userId || '', req.body);
    res.status(201).json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add record';
    res.status(400).json({ message });
  }
};

export const updateAcademicRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await teacherService.updateAcademicRecord(
      req.params.id,
      req.user?.userId || '',
      req.body
    );
    if (!record) {
      res.status(404).json({ message: 'Record not found' });
      return;
    }
    res.status(200).json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update record';
    res.status(400).json({ message });
  }
};

export const getAcademicRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await teacherService.getAcademicRecords(req.user?.userId || '');
    res.status(200).json(records);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get records';
    res.status(500).json({ message });
  }
};

export const addSubjectTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await teacherService.addSubjectTopic(req.user?.userId || '', req.body);
    res.status(201).json(topic);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add topic';
    res.status(400).json({ message });
  }
};

export const updateSubjectTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await teacherService.updateSubjectTopic(
      req.params.id,
      req.user?.userId || '',
      req.body
    );
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    res.status(200).json(topic);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update topic';
    res.status(400).json({ message });
  }
};

export const deleteSubjectTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await teacherService.deleteSubjectTopic(req.params.id, req.user?.userId || '');
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    res.status(200).json({ message: 'Topic deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete topic';
    res.status(400).json({ message });
  }
};

export const getSubjectTopics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await teacherService.getSubjectTopics(req.user?.userId || '');
    res.status(200).json(topics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get topics';
    res.status(500).json({ message });
  }
};

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await teacherService.createAssignment(req.user?.userId || '', req.body);
    res.status(201).json(assignment);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create assignment';
    res.status(400).json({ message });
  }
};

export const createBulkAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignments = await teacherService.createBulkAssignments(req.user?.userId || '', req.body);
    res.status(201).json(assignments);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create assignments';
    res.status(400).json({ message });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await teacherService.updateAssignment(
      req.params.id,
      req.user?.userId || '',
      req.body
    );
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }
    res.status(200).json(assignment);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update assignment';
    res.status(400).json({ message });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignments = await teacherService.getAssignments(req.user?.userId || '');
    res.status(200).json(assignments);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get assignments';
    res.status(500).json({ message });
  }
};
