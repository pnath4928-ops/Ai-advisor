import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as studyTopicService from '../services/studyTopicService';

export const createTopics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await studyTopicService.createTopics(
      req.user?.userId || '',
      req.body.studyTaskId,
      req.body.topics
    );
    res.status(201).json(topics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create topics';
    res.status(400).json({ message });
  }
};

export const getTopicsByTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await studyTopicService.getTopicsByTask(req.user?.userId || '', req.params.taskId);
    res.status(200).json(topics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get topics';
    const status = message.includes('unauthorized') ? 403 : message.includes('not found') ? 404 : 500;
    res.status(status).json({ message });
  }
};

export const getTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await studyTopicService.getTopic(req.user?.userId || '', req.params.id);
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    res.status(200).json(topic);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get topic';
    const status = message.includes('unauthorized') ? 403 : message.includes('not found') ? 404 : 500;
    res.status(status).json({ message });
  }
};

export const updateTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await studyTopicService.updateTopic(req.user?.userId || '', req.params.id, req.body);
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    res.status(200).json(topic);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update topic';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ message });
  }
};

export const deleteTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await studyTopicService.deleteTopic(req.user?.userId || '', req.params.id);
    res.status(200).json({ message: 'Topic deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete topic';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ message });
  }
};
