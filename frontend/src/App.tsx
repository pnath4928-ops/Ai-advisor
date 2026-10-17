import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { DashboardPage } from '@/pages/Dashboard';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SessionBootstrap } from '@/components/SessionBootstrap';
import { UnauthorizedPage } from '@/pages/Unauthorized';
import { StudentsPage } from '@/pages/teacher/StudentsPage';
import { AcademicRecordsPage } from '@/pages/teacher/AcademicRecordsPage';
import { AssignmentsPage } from '@/pages/teacher/AssignmentsPage';
import { SubjectsPage } from '@/pages/teacher/SubjectsPage';
import { ProfilePage } from '@/pages/student/ProfilePage';
import { StudyPlansPage } from '@/pages/student/StudyPlansPage';
import { TasksPage } from '@/pages/student/TasksPage';
import { ExamsPage } from '@/pages/student/ExamsPage';
import { StudentAcademicRecordsPage } from '@/pages/student/StudentAcademicRecordsPage';
import { StudyTasksPage } from '@/pages/student/StudyTasksPage';
import { StudentAssignmentsPage } from '@/pages/student/StudentAssignmentsPage';
import { StudentProgressPage } from '@/pages/student/StudentProgressPage';
import { AIAdvisorPage } from '@/pages/student/AIAdvisorPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { TeachersPage } from '@/pages/admin/TeachersPage';
import { AdminStudentsPage } from '@/pages/admin/StudentsPage';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3500}
            toastOptions={{
              style: {
                background: '#1C2233',
                border: '1px solid rgba(124, 92, 255, 0.2)',
                color: '#E8E8ED',
              },
            }}
          />
          <SessionBootstrap>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><StudentsPage /></ProtectedRoute>} />
              <Route path="teacher/academic-records" element={<ProtectedRoute allowedRoles={['teacher']}><AcademicRecordsPage /></ProtectedRoute>} />
              <Route path="teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><AssignmentsPage /></ProtectedRoute>} />
              <Route path="teacher/subjects" element={<ProtectedRoute allowedRoles={['teacher']}><SubjectsPage /></ProtectedRoute>} />
              <Route path="student/profile" element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>} />
              <Route path="student/study-plans" element={<ProtectedRoute allowedRoles={['student']}><StudyPlansPage /></ProtectedRoute>} />
              <Route path="student/tasks" element={<ProtectedRoute allowedRoles={['student']}><TasksPage /></ProtectedRoute>} />
              <Route path="student/study-sessions" element={<ProtectedRoute allowedRoles={['student']}><StudyTasksPage /></ProtectedRoute>} />
              <Route path="student/exams" element={<ProtectedRoute allowedRoles={['student']}><ExamsPage /></ProtectedRoute>} />
              <Route path="student/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignmentsPage /></ProtectedRoute>} />
              <Route path="student/academic-records" element={<ProtectedRoute allowedRoles={['student']}><StudentAcademicRecordsPage /></ProtectedRoute>} />
              <Route path="student/progress" element={<ProtectedRoute allowedRoles={['student']}><StudentProgressPage /></ProtectedRoute>} />
              <Route path="student/ai-advisor" element={<ProtectedRoute allowedRoles={['student']}><AIAdvisorPage /></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
              <Route path="admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeachersPage /></ProtectedRoute>} />
              <Route path="admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentsPage /></ProtectedRoute>} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SessionBootstrap>
        </BrowserRouter>
      </QueryClientProvider>
    </MotionConfig>
  );
}

export default App;
