import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/motion/EmptyState';
import { QueryErrorState } from '@/components/QueryErrorState';
import { fadeUp } from '@/lib/motion';

export const StudentAcademicRecordsPage = () => {
  const { data: records, isLoading, isError } = useQuery({
    queryKey: ['student', 'academicRecords'],
    queryFn: studentApi.getAcademicRecords,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Academic Records</h1>
        <p className="text-sm text-text-secondary mt-1">Your academic performance</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Subject</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Grade</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Score</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Attendance</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Term</th>
                  <th className="text-left p-4 text-xs font-medium text-text-secondary">Notes</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-tertiary">
                        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <QueryErrorState queryKey={['student', 'academicRecords']} colSpan={6} message="We couldn't load your academic records." />
                ) : records && records.length > 0 ? (
                  records.map((record) => (
                    <motion.tr
                      key={record._id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-secondary/50 transition-colors"
                    >
                      <td className="p-4"><Badge variant="secondary">{record.subjectName}</Badge></td>
                      <td className="p-4 text-sm font-semibold text-text-primary">{record.grade}</td>
                      <td className="p-4 text-sm text-text-secondary">{record.score}%</td>
                      <td className="p-4 text-sm text-text-secondary">{record.attendedClasses}/{record.totalClasses}</td>
                      <td className="p-4 text-xs text-text-secondary uppercase tracking-wider">{record.term}</td>
                      <td className="p-4 text-sm text-text-secondary max-w-[200px] truncate">{record.teacherNotes || '-'}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <EmptyState
                        icon={<BarChart3 className="w-6 h-6 text-text-tertiary" />}
                        title="No records found"
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
