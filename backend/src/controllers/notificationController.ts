import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as notificationService from '../services/notificationService';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await notificationService.getNotifications(req.user?.userId || '');
    res.status(200).json(notifications);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get notifications';
    res.status(500).json({ message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await notificationService.getUnreadCount(req.user?.userId || '');
    res.status(200).json({ count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get count';
    res.status(500).json({ message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user?.userId || '');
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.status(200).json(notification);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as read';
    res.status(500).json({ message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await notificationService.markAllAsRead(req.user?.userId || '');
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark all as read';
    res.status(500).json({ message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id, req.user?.userId || '');
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete notification';
    res.status(500).json({ message });
  }
};
