import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { SUPABASE_ACCESS_TOKEN_COOKIE } from '@/features/auth/constants';

const AUTH_ROUTE_PREFIXES = ['/login', '/signup', '/invite'];
const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/purchase-orders',
  '/quantity-surveys',
  '/imports',
  '/alerts',
  '/settings',
];

function isBypassPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets')
  );
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value);

  if (isAuthRoute(pathname) && hasSession) {
    const redirectUrl = nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  if (!hasSession && isProtectedRoute(pathname)) {
    const redirectUrl = nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
