"use server";
import { cookies } from "next/headers";

export async function handleThemeChange(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, { maxAge: 6969696969 });
}
