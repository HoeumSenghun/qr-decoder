import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GATE_COOKIE, isValidGateToken } from "@/lib/gate";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await isValidGateToken(request.cookies.get(GATE_COOKIE)?.value);

  if (pathname === "/login") {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
