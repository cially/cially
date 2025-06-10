"use server"

import { cookies } from "next/headers";

export default async function SignOut() {
	const cookieStore = await cookies();
	cookieStore.delete("pb_auth");
}
