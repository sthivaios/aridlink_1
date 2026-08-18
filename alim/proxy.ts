import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // if pathname is /explod then move on without doing anything else and go to the route
  if (pathname === "/explod") {
    return NextResponse.next();
  }

  // send users on the root route to login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
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
