import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { teacherApi } from '@/api/teacher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/motion/Avatar';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { fadeUp } from '@/lib/motion';
import { Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { populatedName } from '@/lib/utils';

export const StudentsPage = () => {
  const { profile } = useAuthStore();
  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: teacherApi.getStudents,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Students</h1>
          <p className="text-sm text-text-secondary mt-1">
            Students in your assigned classes ({profile && 'assignedClasses' in profile ? (profile as { assignedClasses: string[] }).assignedClasses.join(', ') : ''})
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Name</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Student ID</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Grade</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Section</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-tertiary">
                        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <QueryErrorState queryKey={['teacher', 'students']} colSpan={4} message="We couldn't load the student roster." />
                ) : students && students.length > 0 ? (
                  students.map((student) => {
                    const userName = populatedName(student.userId);
                    return (
                    <motion.tr
                      key={student._id}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-secondary/50 transition-colors"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={userName} />
                          <span className="text-sm font-medium text-text-primary">{userName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-text-secondary uppercase tracking-wider font-mono">{student.studentId}</td>
                      <td className="p-4"><Badge variant="secondary">Grade {student.gradeLevel}</Badge></td>
                      <td className="p-4 text-sm text-text-secondary">{student.section}</td>
                    </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <EmptyState
                        icon={<Users className="w-6 h-6 text-text-tertiary" />}
                        title="No students found"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
