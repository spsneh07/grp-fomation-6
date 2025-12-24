import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/signup' || path === '/forgot-password' || path.startsWith('/reset-password');

  // Check for the token (or session cookie if using NextAuth)
  // Note: NextAuth uses 'next-auth.session-token' or '__Secure-next-auth.session-token'
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value;

  // 1. Redirect LOGGED-IN users AWAY from public pages (like login)
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // 2. Redirect LOGGED-OUT users AWAY from protected pages
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/dashboard/:path*', // Protect all dashboard routes
    '/profile/:path*',   // Protect profile
    '/settings/:path*',  // Protect settings
    '/projects/:path*',  // Protect projects
    '/onboarding'
  ]
};