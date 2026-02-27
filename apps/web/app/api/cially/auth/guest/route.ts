import PocketBase from "pocketbase";

const pb_url = process.env.POCKETBASE_URL;

const GUEST_EMAIL =
  "cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com";
const GUEST_PASSWORD = "do-not-create-an-admin-account-with-this-address";

export async function POST() {
  try {
    const pb = new PocketBase(pb_url);

    // Authenticate as the guest user
    await pb.collection("users").authWithPassword(GUEST_EMAIL, GUEST_PASSWORD);

    const cookieStr = pb.authStore.exportToCookie({ httpOnly: false });

    return new Response(JSON.stringify({ token: pb.authStore.token }), {
      status: 200,
      headers: {
        "Set-Cookie": cookieStr,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Guest login failed:", error);
    return Response.json(
      { error: error.message || "Guest login failed" },
      { status: 401 }
    );
  }
}
