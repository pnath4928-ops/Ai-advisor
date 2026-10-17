import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const logout = useAuthStore((state) => state.logout);

  const hasToken = !!localStorage.getItem('accessToken');
  const needsUser = hasToken && !user;

  const { data, isSuccess, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: needsUser,
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (needsUser && isSuccess && data) {
      setUser(data.user);
      setProfile(data.profile ?? null);
    }
  }, [needsUser, isSuccess, data, setUser, setProfile]);

  useEffect(() => {
    if (needsUser && isError) {
      logout();
    }
  }, [needsUser, isError, logout]);

  if (hasToken && !user && !isError) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
