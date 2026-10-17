import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as analyticsService from '../services/analyticsService';

export const getTeacherAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await analyticsService.getTeacherAnalytics(req.user?.userId || '');
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    res.status(500).json({ message });
  }
};

export const getStudentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await analyticsService.getStudentAnalytics(req.user?.userId || '');
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    res.status(500).json({ message });
  }
};

export const getStudentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await analyticsService.getStudentProgressData(req.user?.userId || '');
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get student progress';
    res.status(500).json({ message });
  }
};
