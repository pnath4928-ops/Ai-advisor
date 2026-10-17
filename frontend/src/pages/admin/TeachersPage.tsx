import { useState } from 'react';
import { useAdminTeachers } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Avatar } from '@/components/motion/Avatar';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { BookOpen } from 'lucide-react';
import { populatedName, populatedEmail } from '@/lib/utils';

export const TeachersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminTeachers({ search: search || undefined, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Teacher Management</h1>
        <p className="text-sm text-text-secondary mt-1">Manage teacher accounts</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-text-primary">Teachers ({data?.total || 0})</CardTitle>
          <Input
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-48"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i}><Skeleton variant="rectangular" className="h-12" /></div>)}
            </div>
          ) : isError ? (
            <QueryErrorState queryKey={['admin', 'teachers']} message="We couldn't load teachers." />
          ) : (
            <>
              <StaggerContainer className="space-y-2" stagger={0.05}>
                {data?.teachers.map((teacher) => {
                  const name = populatedName(teacher.userId);
                  const email = populatedEmail(teacher.userId);
                  return (
                    <StaggerItem key={teacher._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{name}</p>
                          <p className="text-xs text-text-tertiary">{email} · {teacher.teacherId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{teacher.department}</Badge>
                        <span className="text-xs text-text-tertiary">{teacher.assignedClasses.length} class(es)</span>
                      </div>
                    </StaggerItem>
                  );
                })}
                {data?.teachers.length === 0 && (
                  <EmptyState
                    icon={<BookOpen className="w-6 h-6 text-text-tertiary" />}
                    title="No teachers found"
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
