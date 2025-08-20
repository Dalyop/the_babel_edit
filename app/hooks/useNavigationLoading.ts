// 'use client';
// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useLoadingStore } from '@/app/store';

// export const useNavigationLoading = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { setLoading, clearLoading } = useLoadingStore();

//   // Custom navigation function with loading
//   const navigateWithLoading = (url: string, message?: string) => {
//     setLoading(true, message || 'Loading...');
//     router.push(url);
//   };

//   const replaceWithLoading = (url: string, message?: string) => {
//     setLoading(true, message || 'Loading...');
//     router.replace(url);
//   };

//   const backWithLoading = (message?: string) => {
//     setLoading(true, message || 'Going back...');
//     router.back();
//   };

//   // Clear loading when pathname changes (navigation complete)
//   useEffect(() => {
//     clearLoading();
//   }, [pathname, clearLoading]);

//   return {
//     navigateWithLoading,
//     replaceWithLoading,
//     backWithLoading,
//     router, // Original router for cases where loading isn't needed
//   };
// };

// useNavigationLoading.ts
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { useLoadingStore } from '@/app/store';

export const useNavigationLoading = () => {
  const router = useRouter();
  const { setLoading } = useLoadingStore();
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();

  const navigateWithLoading = useCallback((url: string) => {
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Don't show loading for same page navigation
    if (window.location.pathname === url) {
      return;
    }

    // Set loading state
    setLoading(true);

    // Navigate
    router.push(url);

    // Clear loading after timeout as fallback
    navigationTimeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 second timeout

  }, [router, setLoading]);

  // Function to manually clear loading (call this in your pages)
  const clearLoading = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    setLoading(false);
  }, [setLoading]);

  return {
    navigateWithLoading,
    clearLoading
  };
};