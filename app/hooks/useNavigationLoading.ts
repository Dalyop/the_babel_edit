'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLoadingStore } from '@/app/store';

export const useNavigationLoading = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading, clearLoading } = useLoadingStore();

  // Custom navigation function with loading
  const navigateWithLoading = (url: string, message?: string) => {
    setLoading(true, message || 'Loading...');
    router.push(url);
  };

  const replaceWithLoading = (url: string, message?: string) => {
    setLoading(true, message || 'Loading...');
    router.replace(url);
  };

  const backWithLoading = (message?: string) => {
    setLoading(true, message || 'Going back...');
    router.back();
  };

  // Clear loading when pathname changes (navigation complete)
  useEffect(() => {
    clearLoading();
  }, [pathname, clearLoading]);

  return {
    navigateWithLoading,
    replaceWithLoading,
    backWithLoading,
    router, // Original router for cases where loading isn't needed
  };
};
