import PocketBase from "pocketbase";

const pb_url = process.env.POCKETBASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const pb = new PocketBase(pb_url);
    const authData = await pb.collection("users").authWithPassword(email, password);

    const cookieStr = pb.authStore.exportToCookie({ httpOnly: false });

    return new Response(JSON.stringify({ token: pb.authStore.token }), {
      status: 200,
      headers: {
        "Set-Cookie": cookieStr,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Login failed" },
      { status: 401 },
    );
  }
}
