import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as studySessionService from '../services/studySessionService';

export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await studySessionService.startSession(
      req.user?.userId || '',
      req.body.studyTaskId,
      req.body.studyTopicId
    );
    res.status(201).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start session';
    const status = message.includes('already have') || message.includes('already completed') || message.includes('not found')
      ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const pauseSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await studySessionService.pauseSession(
      req.user?.userId || '',
      req.params.id
    );
    res.status(200).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to pause session';
    const status = message.includes('not found') || message.includes('not active') ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const resumeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await studySessionService.resumeSession(
      req.user?.userId || '',
      req.params.id
    );
    res.status(200).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resume session';
    const status = message.includes('not found') || message.includes('not paused') ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await studySessionService.endSession(
      req.user?.userId || '',
      req.params.id
    );
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end session';
    const status = message.includes('not found') || message.includes('already completed') ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const getActiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await studySessionService.getActiveSession(req.user?.userId || '');
    res.status(200).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get active session';
    res.status(500).json({ message });
  }
};

export const getSessionsByTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await studySessionService.getSessionsByTask(
      req.user?.userId || '',
      req.params.taskId
    );
    res.status(200).json(sessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get sessions';
    res.status(500).json({ message });
  }
};

export const getSessionTimers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const timers = await studySessionService.getSessionTimers(req.user?.userId || '');
    res.status(200).json(timers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get session timers';
    res.status(500).json({ message });
  }
};
