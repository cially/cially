import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import PocketBase from "pocketbase";

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

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
			throw new Error("Invalid or missing auth");
		}
		await pb.collection("users").authRefresh();

		if (pathname === "/login") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	} catch (_err) {
		if (pathname !== "/login") {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}
}

// See "Matching Paths" below to learn more
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
