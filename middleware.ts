// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // Route configuration with role requirements
// const ROUTES_CONFIG = {
//   PROTECTED: ['/account'] as const,
//   ADMIN: {
//     ALL: ['/admin'] as const,
//     SUPER_ADMIN_ONLY: ['/admin/users', '/admin/settings'] as const,
//   },
//   AUTH_REQUIRED: ['/cart', '/wishlist'] as const,
//   PUBLIC_AUTH: ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'] as const,
// } as const;

// type UserRole = 'admin' | 'super_admin' | 'user' | undefined;

// // Helper function to check if path matches any route in array
// const matchesRoute = (pathname: string, routes: readonly string[], locale: string): boolean => {
//   return routes.some(route => pathname.startsWith(`/${locale}${route}`));
// };

// // Helper to check admin access level
// const hasAdminAccess = (pathname: string, userRole: UserRole, currentLocale: string): boolean => {
//   const isSuperAdminRoute = matchesRoute(pathname, ROUTES_CONFIG.ADMIN.SUPER_ADMIN_ONLY, currentLocale);
//   if (isSuperAdminRoute) {
//     return userRole === 'super_admin';
//   }
//   return userRole === 'admin' || userRole === 'super_admin';
// };

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const currentLocale = request.nextUrl.locale || 'en';

//   // Get authentication data
//   const authToken = request.cookies.get('accessToken')?.value;
//   const userRole = request.cookies.get('userRole')?.value?.toLowerCase() as UserRole;
  
//   const isAuthenticated = !!authToken;

//   // Check route types
//   const isProtectedRoute = matchesRoute(pathname, ROUTES_CONFIG.PROTECTED, currentLocale);
//   const isAdminRoute = matchesRoute(pathname, ROUTES_CONFIG.ADMIN.ALL, currentLocale);
//   const isAuthRequiredRoute = matchesRoute(pathname, ROUTES_CONFIG.AUTH_REQUIRED, currentLocale);
//   const isPublicAuthRoute = matchesRoute(pathname, ROUTES_CONFIG.PUBLIC_AUTH, currentLocale);

//   // 1. Handle admin route protection first (strongest protection)
//   if (isAdminRoute) {
//     if (!isAuthenticated) {
//       const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
//       redirectUrl.searchParams.set('from', pathname);
//       return NextResponse.redirect(redirectUrl);
//     }

//     if (!hasAdminAccess(pathname, userRole, currentLocale)) {
//       return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
//     }
//   }

//   // 2. Handle protected routes (account pages, etc.)
//   if (isProtectedRoute && !isAuthenticated) {
//     const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
//     redirectUrl.searchParams.set('from', pathname);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // 3. Redirect authenticated users away from auth pages to home page
//   if (isAuthenticated && isPublicAuthRoute) {
//     return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
//   }

//   // 4. Handle soft auth-required routes (add header for frontend handling)
//   if (isAuthRequiredRoute && !isAuthenticated) {
//     const response = NextResponse.next();
//     response.headers.set('x-auth-required', 'true');
//     return response;
//   }

//   // 5. All other routes proceed normally
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Only run on pages, exclude API routes, static files, and internal Next.js files
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
//   ],
// };



import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales
const LOCALES = ['en', 'fr', 'es', 'de'] as const;
const DEFAULT_LOCALE = 'en';

// Route configuration with role requirements
const ROUTES_CONFIG = {
  PROTECTED: ['/account'] as const,
  ADMIN: {
    ALL: ['/admin'] as const,
    SUPER_ADMIN_ONLY: ['/admin/users', '/admin/settings'] as const,
  },
  AUTH_REQUIRED: ['/cart', '/wishlist'] as const,
  PUBLIC_AUTH: ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'] as const,
} as const;

type UserRole = 'admin' | 'super_admin' | 'user' | undefined;

// Helper function to extract locale from pathname
const getLocaleFromPathname = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (LOCALES.includes(firstSegment as any)) {
    return firstSegment;
  }
  
  return DEFAULT_LOCALE;
};

// Helper function to get pathname without locale
const getPathnameWithoutLocale = (pathname: string, locale: string): string => {
  if (pathname.startsWith(`/${locale}`)) {
    return pathname.substring(`/${locale}`.length) || '/';
  }
  return pathname;
};

// Helper function to check if path matches any route in array
const matchesRoute = (pathname: string, routes: readonly string[]): boolean => {
  return routes.some(route => {
    // Exact match
    if (pathname === route) return true;
    // Prefix match for nested routes (e.g., /admin matches /admin/users)
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
};

// Helper to check admin access level
const hasAdminAccess = (pathname: string, userRole: UserRole): boolean => {
  const isSuperAdminRoute = matchesRoute(pathname, ROUTES_CONFIG.ADMIN.SUPER_ADMIN_ONLY);
  if (isSuperAdminRoute) {
    return userRole === 'super_admin';
  }
  return userRole === 'admin' || userRole === 'super_admin';
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract locale from pathname
  const currentLocale = getLocaleFromPathname(pathname);
  
  // Get pathname without locale for route matching
  const pathWithoutLocale = getPathnameWithoutLocale(pathname, currentLocale);

  // Get authentication data
  const authToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value?.toLowerCase() as UserRole;
  
  const isAuthenticated = !!authToken;

  // Debug logging (remove in production)
  console.log('Middleware Debug:', {
    pathname,
    currentLocale,
    pathWithoutLocale,
    isAuthenticated,
    userRole,
    hasToken: !!authToken
  });

  // Check route types using pathname without locale
  const isProtectedRoute = matchesRoute(pathWithoutLocale, ROUTES_CONFIG.PROTECTED);
  const isAdminRoute = matchesRoute(pathWithoutLocale, ROUTES_CONFIG.ADMIN.ALL);
  const isAuthRequiredRoute = matchesRoute(pathWithoutLocale, ROUTES_CONFIG.AUTH_REQUIRED);
  const isPublicAuthRoute = matchesRoute(pathWithoutLocale, ROUTES_CONFIG.PUBLIC_AUTH);

  // 1. Handle admin route protection first (strongest protection)
  if (isAdminRoute) {
    if (!isAuthenticated) {
      console.log('Admin route - not authenticated, redirecting to login');
      const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!hasAdminAccess(pathWithoutLocale, userRole)) {
      console.log('Admin route - insufficient permissions, redirecting to home');
      return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
    }

    console.log('Admin route - access granted');
  }

  // 2. Handle protected routes (account pages, etc.)
  if (isProtectedRoute && !isAuthenticated) {
    console.log('Protected route - not authenticated, redirecting to login');
    const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Redirect authenticated users away from auth pages to home page
  if (isAuthenticated && isPublicAuthRoute) {
    console.log('Auth page - already authenticated, redirecting to home');
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // 4. Handle soft auth-required routes (add header for frontend handling)
  if (isAuthRequiredRoute && !isAuthenticated) {
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'true');
    return response;
  }

  // 5. All other routes proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on pages, exclude API routes, static files, and internal Next.js files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};