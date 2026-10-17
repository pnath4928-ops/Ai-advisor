import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as aiService from '../services/aiService';

export const generateSuggestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.body;
    const suggestion = await aiService.generateAISuggestion(req.user?.userId || '', type);
    res.status(201).json(suggestion);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate suggestion';
    res.status(400).json({ message });
  }
};

export const generateFullPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await aiService.generateStudyPlanFromAI(req.user?.userId || '', {
      scope: req.body?.scope,
    });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate study plan';
    res.status(400).json({ message });
  }
};

export const analyzeWeakSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await aiService.analyzeWeakSubjects(req.user?.userId || '');
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to analyze weak subjects';
    res.status(500).json({ message });
  }
};

export const revisionStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const strategy = await aiService.generateRevisionStrategy(req.user?.userId || '');
    res.status(200).json({ strategy });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate revision strategy';
    res.status(500).json({ message });
  }
};

export const getSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    const suggestions = await aiService.getSuggestions(
      req.user?.userId || '',
      type as string | undefined
    );
    res.status(200).json(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get suggestions';
    res.status(500).json({ message });
  }
};

export const acceptSuggestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const suggestion = await aiService.acceptSuggestion(req.params.id, req.user?.userId || '');
    if (!suggestion) {
      res.status(404).json({ message: 'Suggestion not found' });
      return;
    }
    res.status(200).json(suggestion);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept suggestion';
    res.status(400).json({ message });
  }
};

export const rejectSuggestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const suggestion = await aiService.rejectSuggestion(req.params.id, req.user?.userId || '');
    if (!suggestion) {
      res.status(404).json({ message: 'Suggestion not found' });
      return;
    }
    res.status(200).json({ message: 'Suggestion rejected' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject suggestion';
    res.status(400).json({ message });
  }
};

export const getAdvisor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await aiService.getAdvisorData(req.user?.userId || '');
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get advisor data';
    res.status(500).json({ message });
  }
};

export const askQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, history } = req.body;
    if (!question) {
      res.status(400).json({ message: 'Question is required' });
      return;
    }
    const result = await aiService.askAI(
      req.user?.userId || '',
      question,
      Array.isArray(history) ? history : undefined
    );
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get answer';
    res.status(500).json({ message });
  }
};
