import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { useAdminUsers } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Avatar } from '@/components/motion/Avatar';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { EmptyState } from '@/components/motion/EmptyState';
import { Users, Plus, Trash2 } from 'lucide-react';

const roleColors: Record<string, string> = {
  student: 'bg-success-subtle text-success',
  teacher: 'bg-info-subtle text-info',
  admin: 'bg-primary/15 text-primary',
};

const emptyForm = { name: '', email: '', password: '', role: 'student' as 'student' | 'teacher' | 'admin' };

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    page,
  });

  const createUser = useMutation({
    mutationFn: () => adminApi.createUser(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('User created');
      setIsAddOpen(false);
      setForm(emptyForm);
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to create user'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('User deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete user'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage all system users</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm font-semibold text-text-primary">Users ({data?.total || 0})</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-48"
            />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 py-2 rounded-xl bg-surface-secondary border border-border text-sm text-text-primary"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12"><Skeleton variant="rectangular" className="h-12" /></div>)}
            </div>
          ) : isError ? (
            <QueryErrorState queryKey={['admin', 'users']} message="We couldn't load users." />
          ) : (
            <>
              <StaggerContainer className="space-y-2" stagger={0.05}>
                {data?.users.map((user) => (
                  <StaggerItem key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-tertiary">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={roleColors[user.role]}>{user.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete user ${user.name}?`)) deleteUser.mutate(user._id);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-danger" />
                      </Button>
                    </div>
                  </StaggerItem>
                ))}
                {data?.users.length === 0 && (
                  <EmptyState
                    icon={<Users className="w-6 h-6 text-text-tertiary" />}
                    title="No users found"
                  />
                )}
              </StaggerContainer>
              <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsAddOpen(false)} />
          <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); createUser.mutate(); }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
