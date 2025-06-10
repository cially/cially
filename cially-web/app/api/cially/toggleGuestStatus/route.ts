import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export async function POST() {
	try {
		await pb
			.collection("_superusers")
			.authWithPassword(
				process.env.POCKETBASE_ADMIN_EMAIL,
				process.env.POCKETBASE_ADMIN_PASSWORD,
			);

		const account = await pb
			.collection("users")
			.getFirstListItem(
				'id!="" && email="cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com"',
				{},
			);

		await pb.collection("users").delete(account.id);

		return Response.json({ new_status: "private" });
	} catch (error) {
		if (error.status === 404) {
			const data = {
				email:
					"cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com",
				emailVisibility: true,
				name: "Guest Account",
				admin: false,
				password: "do-not-create-an-admin-account-with-this-address",
				passwordConfirm: "do-not-create-an-admin-account-with-this-address",
			};

			await pb.collection("users").create(data);
			return Response.json({ new_status: "public" });
		}
		console.log(error);
		return Response.json({ error: 404 });
	}
}
