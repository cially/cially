// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};

export async function middleware(request: NextRequest) {
	const url = request.nextUrl;
	const pathname = url.pathname;

	if (
		PUBLIC_ROUTES.some(
			(route) => pathname === route || pathname.startsWith(route + "/"),
		)
	) {
		return NextResponse.next();
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
			throw new Error("Invalid or missing auth");
		}

		await pb.collection("users").authRefresh();
	} catch (_err) {
		console.warn("Unauthenticated access attempt:", pathname);
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}
