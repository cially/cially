import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "./_components/_shadcn/theme-provider";
import "./globals.css";

const outfit = Outfit({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: "Cially Dashboard",
};

import type { Viewport } from "next";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const theme = cookieStore.get("theme") || { value: "blue" };
	const themeClass = {
		blue: "bg-gr",
		gray: "bg-gr-gray",
		pink: "bg-gr-pink",
		brown: "bg-gr-brown",
	}[theme.value];

	return (
		<>
			<html lang="en" suppressHydrationWarning>
				<head />
				<body className={outfit.className}>
					<div className="overflow-x-hidden min-h-screen">
						<div
							className={`${themeClass} fixed inset-0 w-full h-full -z-10`}
						/>
						<div className="relative z-0 p-6">
							<ThemeProvider
								attribute="class"
								defaultTheme="dark"
								enableSystem
								disableTransitionOnChange
							>
								{children}
							</ThemeProvider>
						</div>
					</div>
				</body>
			</html>
		</>
	);
}
