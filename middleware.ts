import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes
const PROTECTED_ROUTES = ['/account'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_REQUIRED_ROUTES = ['/cart', '/wishlist'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup'];

// Helper function to check if path matches any route in array
const matchesRoute = (pathname: string, routes: string[], locale: string): boolean => {
  return routes.some(route => pathname.startsWith(`/${locale}${route}`));
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentLocale = request.nextUrl.locale || 'en';

  // Early return for static files and API routes (already handled by matcher config)
  
  // Get authentication data once
  const authToken = request.cookies.get('accessToken');
  const userRole = request.cookies.get('userRole')?.value?.toLowerCase();
  
  const isAuthenticated = !!authToken;
  const isAdmin = userRole === 'admin';

  // Check route types once
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES, currentLocale);
  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES, currentLocale);
  const isAuthRequiredRoute = matchesRoute(pathname, AUTH_REQUIRED_ROUTES, currentLocale);
  const isPublicRoute = matchesRoute(pathname, PUBLIC_ROUTES, currentLocale);

  // Handle authentication redirects
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle admin route protection
  if (isAdminRoute && (!isAuthenticated || !isAdmin)) {
    const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth-required routes (soft requirement)
  if (isAuthRequiredRoute && !isAuthenticated) {
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'true');
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on pages, exclude API routes, static files, and internal Next.js files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};