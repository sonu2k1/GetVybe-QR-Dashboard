import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin APIs: /api/hunts and /api/qr
  if (path.startsWith('/api/hunts') || path.startsWith('/api/qr')) {
    const adminSecret = process.env.ADMIN_SECRET;
    
    // Only enforce if ADMIN_SECRET is set in env
    if (adminSecret) {
      const requestSecret = request.headers.get('x-admin-secret');
      if (requestSecret !== adminSecret) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing admin secret' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/hunts/:path*', '/api/qr/:path*'],
};
