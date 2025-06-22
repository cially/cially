import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

// paths that do NOT require authentication
const PUBLIC_PATHS = ["/login", "/register"];

// paths where the guest cookie logic is specifically needed
const GUEST_CHECK_PATHS = [
  "dashboard",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  if (PUBLIC_PATHS.includes(pathname)) {
    return response;
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  const cookie = request.cookies.get("pb_auth")?.value;

  if (cookie) {
    try {
      pb.authStore.loadFromCookie(`pb_auth=${cookie}`);
    } catch (error) {
      console.error("Failed to load auth from cookie:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

 
  try {
    if (!pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
    }

    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (GUEST_CHECK_PATHS.some((path) => pathname.includes(path))) {
      const email = pb.authStore.record?.email;
      if (email) {
        const isGuest =
          email ===
          "cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com";

       
        if (request.cookies.get("guest")?.value !== String(isGuest)) {
          response.cookies.set("guest", String(isGuest), {
            path: "/",
            secure: process.env.NODE_ENV === "production", // Use secure in production
            sameSite: "lax",
          });
        }
      }
    }

    return response; 
  } catch (_err) {
    if (!PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response; 
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};