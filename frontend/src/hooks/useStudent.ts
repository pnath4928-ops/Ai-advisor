import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import { toast } from 'sonner';
import type { StudyPlan, StudyTask, Exam } from '@/types';

export const useStudent = () => {
  const queryClient = useQueryClient();

  const useProfile = () =>
    useQuery({
      queryKey: ['student', 'profile'],
      queryFn: studentApi.getProfile,
    });

  const useStudyPlans = () =>
    useQuery({
      queryKey: ['student', 'study-plans'],
      queryFn: studentApi.getStudyPlans,
    });

  const useTasks = () =>
    useQuery({
      queryKey: ['student', 'tasks'],
      queryFn: studentApi.getTasks,
    });

  const useProgress = () =>
    useQuery({
      queryKey: ['student', 'progress'],
      queryFn: studentApi.getProgress,
    });

  const useExams = () =>
    useQuery({
      queryKey: ['student', 'exams'],
      queryFn: studentApi.getExams,
    });

  const useAcademicRecords = () =>
    useQuery({
      queryKey: ['student', 'academicRecords'],
      queryFn: studentApi.getAcademicRecords,
    });

  const useAssignments = () =>
    useQuery({
      queryKey: ['student', 'assignments'],
      queryFn: studentApi.getAssignments,
    });

  const updateProfile = useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const createStudyPlan = useMutation({
    mutationFn: studentApi.createStudyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'study-plans'] });
      toast.success('Study plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create study plan');
    },
  });

  const updateStudyPlan = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudyPlan> }) =>
      studentApi.updateStudyPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'study-plans'] });
      toast.success('Study plan updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update study plan');
    },
  });

  const deleteStudyPlan = useMutation({
    mutationFn: studentApi.deleteStudyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'topics'] });
      toast.success('Study plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete study plan');
    },
  });

  const createTask = useMutation({
    mutationFn: studentApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Task created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudyTask> }) =>
      studentApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Task updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  const deleteTask = useMutation({
    mutationFn: studentApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  const logProgress = useMutation({
    mutationFn: studentApi.logProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Progress logged successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log progress');
    },
  });

  const addExam = useMutation({
    mutationFn: studentApi.addExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Exam added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add exam');
    },
  });

  const updateExam = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exam> }) =>
      studentApi.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Exam updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update exam');
    },
  });

  const submitAssignment = useMutation({
    mutationFn: ({ id, studentAnswer }: { id: string; studentAnswer: string }) =>
      studentApi.submitAssignment(id, studentAnswer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'student', 'progress'] });
      toast.success('Assignment submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit assignment');
    },
  });

  return {
    useProfile,
    useStudyPlans,
    useTasks,
    useProgress,
    useExams,
    useAcademicRecords,
    useAssignments,
    updateProfile,
    createStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
    createTask,
    updateTask,
    deleteTask,
    logProgress,
    addExam,
    updateExam,
    submitAssignment,
  };
};
