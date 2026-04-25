import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login');
  const isRootRoute = pathname === '/';

  // Redirige / y rutas protegidas al login si no hay token
  if (!token && (isRootRoute || (!isAuthRoute))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya tiene token y va al login o raíz, redirige al dashboard
  if (token && (isAuthRoute || isRootRoute)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};