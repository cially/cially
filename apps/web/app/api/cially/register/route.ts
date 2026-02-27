import PocketBase from "pocketbase";

const pb_url = process.env.POCKETBASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const pb = new PocketBase(pb_url);

    // Authenticate as superuser to create new users
    await pb
      .collection("_superusers")
      .authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL!,
        process.env.POCKETBASE_ADMIN_PASSWORD!
      );

    const data = {
      email,
      emailVisibility: true,
      name: "Admin",
      password,
      passwordConfirm: password,
      admin: true,
    };

    await pb.collection("users").create(data);

    return Response.json({ status: "success" });
  } catch (error: any) {
    console.error("Registration failed:", error);
    return Response.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
