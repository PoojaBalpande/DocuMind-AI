import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Auth pages: /login, /signup
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  if (isAuthRoute) {
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/documents/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
  ],
};
