import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp', '/health'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Public routes (allow without auth)
  if (publicRoutes.includes(pathname)) {
    if (authRoutes.includes(pathname) && accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (require auth)
  if (!accessToken && pathname.startsWith('/(dashboard)')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
