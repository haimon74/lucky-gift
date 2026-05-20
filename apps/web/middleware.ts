import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /settings/* (but not /settings/login)
  if (!pathname.startsWith('/settings') || pathname.startsWith('/settings/login')) {
    return NextResponse.next();
  }

  // Check for session cookie OR Authorization header
  const cookie = request.cookies.get('lucky_gift_admin_session')?.value;
  const auth = request.headers.get('Authorization');
  const hasToken = !!cookie || !!auth?.startsWith('Bearer ');

  if (!hasToken) {
    return NextResponse.redirect(new URL('/settings/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings/:path*'],
};
