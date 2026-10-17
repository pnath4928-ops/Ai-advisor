import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@/api/teacher';
import { toast } from 'sonner';
import type { AcademicRecord, SubjectTopic, Assignment } from '@/types';

export const useTeacher = () => {
  const queryClient = useQueryClient();

  const useStudents = () =>
    useQuery({
      queryKey: ['teacher', 'students'],
      queryFn: teacherApi.getStudents,
    });

  const useAcademicRecords = () =>
    useQuery({
      queryKey: ['teacher', 'academicRecords'],
      queryFn: teacherApi.getAcademicRecords,
    });

  const useSubjectTopics = () =>
    useQuery({
      queryKey: ['teacher', 'subjects'],
      queryFn: teacherApi.getSubjectTopics,
    });

  const useAssignments = () =>
    useQuery({
      queryKey: ['teacher', 'assignments'],
      queryFn: teacherApi.getAssignments,
    });

  const addAcademicRecord = useMutation({
    mutationFn: teacherApi.addAcademicRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'academicRecords'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Academic record added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add academic record');
    },
  });

  const updateAcademicRecord = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AcademicRecord> }) =>
      teacherApi.updateAcademicRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'academicRecords'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Academic record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update academic record');
    },
  });

  const addSubjectTopic = useMutation({
    mutationFn: teacherApi.addSubjectTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subjects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Subject topic added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add subject topic');
    },
  });

  const updateSubjectTopic = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubjectTopic> }) =>
      teacherApi.updateSubjectTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subjects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Subject topic updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject topic');
    },
  });

  const deleteSubjectTopic = useMutation({
    mutationFn: teacherApi.deleteSubjectTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'subjects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Subject topic deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subject topic');
    },
  });

  const createAssignment = useMutation({
    mutationFn: teacherApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Assignment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create assignment');
    },
  });

  const createBulkAssignments = useMutation({
    mutationFn: teacherApi.createBulkAssignments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Assignments created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create assignments');
    },
  });

  const updateAssignment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assignment> }) =>
      teacherApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'teacher'] });
      toast.success('Assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update assignment');
    },
  });

  return {
    useStudents,
    useAcademicRecords,
    useSubjectTopics,
    useAssignments,
    addAcademicRecord,
    updateAcademicRecord,
    addSubjectTopic,
    updateSubjectTopic,
    deleteSubjectTopic,
    createAssignment,
    createBulkAssignments,
    updateAssignment,
  };
};
