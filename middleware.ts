import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;
      
      // Always allow access to auth-related routes
      if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
        return true;
      }

      // Protect dashboard and other private routes
      if (pathname.startsWith('/dashboard')) {
        return !!token;
      }

      // Allow access to public routes
      return true;
    },
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 