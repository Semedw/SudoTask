// ============================================
// Proxy for Route Protection
// ============================================
// Note: Authentication is handled in layout.tsx files
// This proxy allows all routes to pass through

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Allow all requests to pass through
  // Authentication and role-based protection is handled in:
  // - /app/teacher/layout.tsx (checks for TEACHER role)
  // - /app/student/layout.tsx (checks for STUDENT role)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
