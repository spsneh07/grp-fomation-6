import { NextResponse } from 'next/server';

// This function runs before every request to the specific paths defined below
export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define paths that are public (accessible without login)
  const isPublicPath = path === '/login' || path === '/signup';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';

  // 1. If user is ON a public path (like login) BUT has a token, 
  // redirect them to the dashboard (they are already logged in).
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // 2. If user is NOT on a public path (trying to access dashboard/onboarding)
  // AND has NO token, redirect them to login.
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/dashboard',
    '/onboarding', 
    // Add other protected routes here if needed
  ]
};