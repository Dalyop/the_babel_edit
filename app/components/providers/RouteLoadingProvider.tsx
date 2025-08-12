'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoadingStore } from '@/app/store';

export const RouteLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { clearLoading } = useLoadingStore();

  useEffect(() => {
    // Clear loading state when route changes are complete
    clearLoading();
  }, [pathname, searchParams, clearLoading]);

  return <>{children}</>;
};
