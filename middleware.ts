import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes
const PROTECTED_ROUTES = ['/account'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_REQUIRED_ROUTES = ['/cart', '/wishlist'];
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname, locale } = request.nextUrl;
  const currentLocale = locale || 'en';

  // Debug: Log the current path (temporarily disabled)
  // console.log('🔍 Middleware running for path:', pathname);

  // Get token from cookies
  const authToken = request.cookies.get('accessToken');
  const isAuthenticated = !!authToken;

  // Debug: Log all cookies (temporarily disabled)
  // console.log('🍪 All cookies:', request.cookies.getAll());
  // console.log('🔑 Access token exists:', !!authToken);
  // console.log('🔑 Access token value:', authToken?.value?.substring(0, 20) + '...');

  // Check if current path is in protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(`/${currentLocale}${route}`)
  );

  // Check if current path is an admin route
  const isAdminRoute = ADMIN_ROUTES.some(route =>
    pathname.startsWith(`/${currentLocale}${route}`)
  );

  // Check if current path requires auth for content (but not access)
  const isAuthRequiredRoute = AUTH_REQUIRED_ROUTES.some(route => 
    pathname.startsWith(`/${currentLocale}${route}`)
  );

  // Get user role from cookie - this will now work with your AuthContext
  const userRoleCookie = request.cookies.get('userRole');
  const userRole = userRoleCookie?.value;
  
  // Debug: Enhanced role logging (temporarily disabled)
  // console.log('👤 User role cookie exists:', !!userRoleCookie);
  // console.log('👤 User role value:', userRole);
  // console.log('👤 Is admin check:', userRole === 'admin');
  
  const isAdmin = userRole?.toLowerCase() === 'admin';

  // Debug: Route type checks (temporarily disabled)
  // console.log('🛡️ Is protected route:', isProtectedRoute);
  // console.log('🛡️ Is admin route:', isAdminRoute);
  // console.log('🛡️ Is auth required route:', isAuthRequiredRoute);
  // console.log('✅ Is authenticated:', isAuthenticated);
  // console.log('👑 Is admin:', isAdmin);

  // Handle protected routes and admin routes
  if ((isProtectedRoute && !isAuthenticated) || (isAdminRoute && (!isAuthenticated || !isAdmin))) {
    // console.log('🚫 Redirecting to login - Failed auth check');
    // console.log('🚫 Reason: Protected route and not authenticated:', isProtectedRoute && !isAuthenticated);
    // console.log('🚫 Reason: Admin route and not admin:', isAdminRoute && (!isAuthenticated || !isAdmin));
    
    const redirectUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For cart and wishlist, we'll let them access but the components will handle showing login prompt
  if (isAuthRequiredRoute && !isAuthenticated) {
    // console.log('📝 Adding auth required header for:', pathname);
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'true');
    return response;
  }

  // Prevent authenticated users from accessing login/signup pages
  if (isAuthenticated && PUBLIC_ROUTES.some(route => 
    pathname.startsWith(`/${currentLocale}${route}`)
  )) {
    // console.log('🔄 Redirecting authenticated user away from auth pages');
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url));
  }

  // console.log('✅ Allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};