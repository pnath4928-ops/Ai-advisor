import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import type { Student } from '@/types';

const mockStudent: Student = {
  _id: '1',
  userId: '1',
  studentId: 'S001',
  gradeLevel: '10',
  section: 'A',
  learningPreference: 'visual',
  preferredStudyTime: 'morning',
  preferredStudyTechnique: 'reading',
  academicGoal: 'ace exams',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('has initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('can login and set user', () => {
    useAuthStore.getState().login(
      { id: '1', name: 'Test User', email: 'test@test.com', role: 'student' },
      mockStudent,
      'access-token',
      'refresh-token',
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Test User');
    expect(state.user?.role).toBe('student');
  });

  it('can logout', () => {
    useAuthStore.getState().login(
      { id: '1', name: 'Test User', email: 'test@test.com', role: 'student' },
      mockStudent,
      'access-token',
      'refresh-token',
    );

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
