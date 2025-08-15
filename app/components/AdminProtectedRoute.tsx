'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(`/${locale}/auth/login`);
      return;
    }

    if (!isAdmin) {
      router.replace(`/${locale}`);
    }
  }, [isAuthenticated, isAdmin, loading, router, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;