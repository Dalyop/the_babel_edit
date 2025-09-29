'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Loading from '@/app/components/ui/Loading/Loading';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  loadingFallback 
}) => {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { user, loading } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super_admin';

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!loading && mounted) {
        if (!isAuthenticated) {
          router.replace(`/${locale}/auth/login?from=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        if (!isAdmin) {
          router.replace(`/${locale}`);
          return;
        }
        setIsInitialLoad(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isAdmin, loading, router, locale]);

  if (loading || isInitialLoad) {
    return loadingFallback || (
      <Loading
        fullScreen={true}
        text="Verifying admin access..."
        size="large"
      />
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return loadingFallback || (
      <Loading
        fullScreen={true}
        text="Redirecting..."
        size="large"
      />
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;