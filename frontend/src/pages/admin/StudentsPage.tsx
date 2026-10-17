import { useState } from 'react';
import { useAdminStudents } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Avatar } from '@/components/motion/Avatar';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { GraduationCap } from 'lucide-react';
import { populatedName, populatedEmail } from '@/lib/utils';

export const AdminStudentsPage = () => {
  const [search, setSearch] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminStudents({
    search: search || undefined,
    gradeLevel: gradeLevel || undefined,
    page,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Student Management</h1>
        <p className="text-sm text-text-secondary mt-1">Manage student accounts</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm font-semibold text-text-primary">Students ({data?.total || 0})</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-48"
            />
            <select
              value={gradeLevel}
              onChange={(e) => { setGradeLevel(e.target.value); setPage(1); }}
              className="h-10 px-3 py-2 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary"
            >
              <option value="">All Grades</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i}><Skeleton variant="rectangular" className="h-12" /></div>)}
            </div>
          ) : isError ? (
            <QueryErrorState queryKey={['admin', 'students']} message="We couldn't load students." />
          ) : (
            <>
              <StaggerContainer className="space-y-2" stagger={0.05}>
                {data?.students.map((student) => {
                  const name = populatedName(student.userId);
                  const email = populatedEmail(student.userId);
                  return (
                    <StaggerItem key={student._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{name}</p>
                          <p className="text-xs text-text-tertiary">{email} · {student.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Grade {student.gradeLevel}</Badge>
                        <span className="text-xs text-text-tertiary">Section {student.section}</span>
                      </div>
                    </StaggerItem>
                  );
                })}
                {data?.students.length === 0 && (
                  <EmptyState
                    icon={<GraduationCap className="w-6 h-6 text-text-tertiary" />}
                    title="No students found"
                  />
                )}
              </StaggerContainer>
              <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
