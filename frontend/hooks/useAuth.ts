'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, signup, logout } = useAuthStore();
  const router = useRouter();

  const handleLogin = useCallback(async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) router.push('/dashboard');
    return success;
  }, [login, router]);

  const handleSignup = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const success = await signup(data);
    if (success) router.push('/dashboard');
    return success;
  }, [signup, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };
}
