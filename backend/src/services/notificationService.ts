import { Notification, INotification } from '../models/Notification';
import { Exam } from '../models/Exam';
import { StudyTask } from '../models/StudyTask';
import { StudyPlan } from '../models/StudyPlan';
import { AISuggestion } from '../models/AISuggestion';
import { Student } from '../models/Student';

export const getNotifications = async (userId: string): Promise<INotification[]> => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ userId, read: false });
};

export const markAsRead = async (id: string, userId: string): Promise<INotification | null> => {
  return Notification.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany({ userId, read: false }, { read: true });
};

export const deleteNotification = async (id: string, userId: string): Promise<INotification | null> => {
  return Notification.findOneAndDelete({ _id: id, userId });
};

const createNotification = async (data: {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, string>;
}): Promise<INotification> => {
  return Notification.create(data);
};

export const generateExamReminders = async (): Promise<number> => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const upcomingExams = await Exam.find({
    examDate: { $gte: new Date(), $lte: threeDaysFromNow },
  });

  let created = 0;
  for (const exam of upcomingExams) {
    const daysUntil = Math.ceil(
      (new Date(exam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const student = await Student.findById(exam.studentId);
    if (!student) continue;
    const userId = student.userId.toString();

    const existing = await Notification.findOne({
      userId: userId,
      type: 'exam_reminder',
      'metadata.examId': exam._id.toString(),
    });

    if (!existing) {
      await createNotification({
        userId,
        type: 'exam_reminder',
        title: `Exam in ${daysUntil} day(s)`,
        message: `${exam.subjectName} ${exam.examType} exam on ${new Date(exam.examDate).toLocaleDateString()}. Preparation level: ${exam.preparationLevel}%`,
        link: '/dashboard/student/exams',
        metadata: { examId: exam._id.toString() },
      });
      created++;
    }
  }
  return created;
};

export const generateTaskReminders = async (): Promise<number> => {
  const activePlans = await StudyPlan.find({ status: 'active' });
  let created = 0;

  for (const plan of activePlans) {
    const pendingTasks = await StudyTask.find({
      studyPlanId: plan._id,
      status: { $ne: 'completed' },
    });

    if (pendingTasks.length > 0) {
      const student = await Student.findById(plan.studentId);
      if (!student) continue;
      const userId = student.userId.toString();

      const existing = await Notification.findOne({
        userId,
        type: 'task_reminder',
        'metadata.planId': plan._id.toString(),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (!existing) {
        await createNotification({
          userId,
          type: 'task_reminder',
          title: `${pendingTasks.length} pending task(s)`,
          message: `You have ${pendingTasks.length} incomplete tasks in your current study plan.`,
          link: '/dashboard/student/tasks',
          metadata: { planId: plan._id.toString() },
        });
        created++;
      }
    }
  }
  return created;
};

export const generateAISuggestionReminders = async (): Promise<number> => {
  const unaccepted = await AISuggestion.find({ accepted: false }).populate('studyPlanId', 'studentId');
  let created = 0;

  for (const suggestion of unaccepted) {
    const plan = suggestion.studyPlanId as unknown as { studentId: { toString(): string } } | null;
    if (!plan?.studentId) continue;

    const student = await Student.findById(plan.studentId.toString());
    if (!student) continue;
    const userId = student.userId.toString();

    const existing = await Notification.findOne({
      userId,
      type: 'ai_suggestion',
      'metadata.suggestionId': suggestion._id.toString(),
    });

    if (!existing) {
      await createNotification({
        userId,
        type: 'ai_suggestion',
        title: 'New AI suggestion',
        message: `You have a new ${suggestion.suggestionType} recommendation from AI.`,
        link: '/dashboard',
        metadata: { suggestionId: suggestion._id.toString() },
      });
      created++;
    }
  }
  return created;
};

export const runReminderChecks = async (): Promise<{
  examReminders: number;
  taskReminders: number;
  aiReminders: number;
}> => {
  const examReminders = await generateExamReminders();
  const taskReminders = await generateTaskReminders();
  const aiReminders = await generateAISuggestionReminders();
  return { examReminders, taskReminders, aiReminders };
};
