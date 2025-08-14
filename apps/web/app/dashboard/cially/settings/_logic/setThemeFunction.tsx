"use server";
import { cookies } from "next/headers";

export async function handleThemeChange(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, { maxAge: 6_969_696_969 });
}
