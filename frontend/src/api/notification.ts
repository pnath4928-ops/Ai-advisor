import api from '@/lib/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'exam_reminder' | 'task_reminder' | 'ai_suggestion' | 'assignment_due' | 'general' | 'success';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
