// Middleware for authentication and tenant resolution
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/docs",
  "/login",
  "/api/webhooks",
  "/api/public",
  "/display",
  "/scoring",
  "/umpire",
];
// WorkOS AuthKit middleware temporarily disabled due to Edge Runtime issues
// TODO: Re-enable after updating to compatible version or using alternative approach
const authMiddleware = authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: publicPaths,
  },
});
export default async function middleware(request: NextRequest, event: any) {
  // 1. Run auth middleware
  const authResponse = await authMiddleware(request, event);

  // 2. Use auth response if it's a redirect, otherwise continue
  const finalResponse = authResponse || NextResponse.next();

  // 3. Set custom headers for server components
  finalResponse.headers.set('x-url', request.url);
  finalResponse.headers.set('x-pathname', request.nextUrl.pathname);


  return finalResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
