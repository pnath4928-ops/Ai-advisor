import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/motion/EmptyState';

interface Props {
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  exam_reminder: 'bg-red-500/15 text-red-400',
  task_reminder: 'bg-yellow-500/15 text-yellow-400',
  ai_suggestion: 'bg-primary/15 text-primary',
  assignment_due: 'bg-blue-500/15 text-blue-400',
  general: 'bg-surface-secondary text-text-secondary',
  success: 'bg-emerald-500/15 text-emerald-400',
};

export const NotificationPanel = ({ onClose }: Props) => {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notification: typeof notifications[0]) => {
    markAsRead.mutate(notification._id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={() => markAllAsRead.mutate()}>
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
        </div>
        <div className="overflow-y-auto max-h-80">
          {isLoading && notifications.length === 0 ? (
            <div className="p-3 space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-surface-secondary animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8 text-text-tertiary" />}
              title="No notifications"
            />
          ) : (
            notifications.map((n, i) => (
              <motion.div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`p-3 border-b border-border/50 cursor-pointer hover:bg-surface-secondary/50 transition-colors ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.25, delay: i * 0.05 }}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${typeColors[n.type] || typeColors.general}`}>
                    {n.type.replace('_', ' ')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{n.title}</p>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-text-tertiary mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n._id); }}
                    className="p-1 rounded hover:bg-red-500/15 text-text-tertiary hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};
