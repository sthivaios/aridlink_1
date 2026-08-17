import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/explod") {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    // if not logged in and not on a public route, send to login
    if (!session && pathname !== "/login" && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth check failed (DB likely down):", error);
    return NextResponse.rewrite(new URL("/explod", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.png|.*\\.svg|.*\\.webp).*)"],
};
