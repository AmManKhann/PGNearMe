import { NextRequest, NextResponse } from "next/server";

const roleHome = (role?: string) =>
  role === "OWNER" ? "/owner" : role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

function redirectTo(url: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(url, request.url), 302);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has("pgnearme_auth");
  const role = request.cookies.get("pgnearme_role")?.value;

  if (pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/onboard") {
    return redirectTo("/", request);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") {
      if (authed && role === "ADMIN") return redirectTo("/admin/dashboard", request);
      return NextResponse.next();
    }
    if (!authed || role !== "ADMIN") {
      return redirectTo("/admin/login", request);
    }
    if (pathname === "/admin") return redirectTo("/admin/dashboard", request);
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (authed) return redirectTo(roleHome(role), request);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)",
  ],
};