import type { Metadata } from "next";
import "./globals.css";
import { Outfit } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";

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

const outfit = Outfit({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme") || { value: "gray" };
  const themeClass = {
    blue: "bg-gr",
    gray: "bg-gr-gray",
    pink: "bg-gr-pink",
    brown: "bg-gr-brown",
    red: "bg-gr-red",
    purple: "bg-gr-purple",
  }[theme.value];

  return (
    <html className={outfit.className} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>

        <div className="min-h-screen overflow-x-hidden">
          <div className={`${themeClass} -z-10 fixed inset-0 h-full w-full`} />
          <div className="relative z-0 p-6">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              enableSystem
            >
              {children}
            </ThemeProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
