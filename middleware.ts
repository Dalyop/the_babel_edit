import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Helper function to check if path matches any route in array
const matchesRoute = (pathname: string, routes: readonly string[], locale: string): boolean => {
  return routes.some(route => pathname.startsWith(`/${locale}${route}`));
};

// Helper to check admin access level
const hasAdminAccess = (pathname: string, userRole: UserRole, currentLocale: string): boolean => {
  const isSuperAdminRoute = matchesRoute(pathname, ROUTES_CONFIG.ADMIN.SUPER_ADMIN_ONLY, currentLocale);
  if (isSuperAdminRoute) {
    return userRole === 'super_admin';
  }
  return userRole === 'admin' || userRole === 'super_admin';
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentLocale = request.nextUrl.locale || 'en';

  // Get authentication data
  const authToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value?.toLowerCase() as UserRole;
  
  const isAuthenticated = !!authToken;

  // Check route types
  const isProtectedRoute = matchesRoute(pathname, ROUTES_CONFIG.PROTECTED, currentLocale);
  const isAdminRoute = matchesRoute(pathname, ROUTES_CONFIG.ADMIN.ALL, currentLocale);
  const isAuthRequiredRoute = matchesRoute(pathname, ROUTES_CONFIG.AUTH_REQUIRED, currentLocale);
  const isPublicAuthRoute = matchesRoute(pathname, ROUTES_CONFIG.PUBLIC_AUTH, currentLocale);

  // 1. Handle admin route protection first (strongest protection)
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!hasAdminAccess(pathname, userRole, currentLocale)) {
      return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
    }
  }

  // 2. Handle protected routes (account pages, etc.)
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Redirect authenticated users away from auth pages to home page
  if (isAuthenticated && isPublicAuthRoute) {
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