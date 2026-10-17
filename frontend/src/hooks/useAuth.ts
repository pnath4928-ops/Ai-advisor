import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { RegisterData, LoginData } from '@/api/auth';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { login, logout, user, profile, isAuthenticated } = useAuthStore();

  const useCurrentUser = () => {
    return useQuery({
      queryKey: ['auth', 'me'],
      queryFn: authApi.getMe,
      enabled: !!localStorage.getItem('accessToken'),
      retry: false,
    });
  };

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      login(data.user, data.profile ?? null, data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      login(data.user, data.profile ?? null, data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  return {
    user,
    profile,
    isAuthenticated,
    useCurrentUser,
    register: registerMutation,
    login: loginMutation,
    logout: handleLogout,
  };
};
