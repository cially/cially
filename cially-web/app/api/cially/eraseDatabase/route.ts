import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export async function DELETE() {
	async function deleteAllFromCollection(collectionName: string) {
		await pb
			.collection("_superusers")
			.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
			
		const records = await pb.collection(collectionName).getFullList();
		await Promise.all(
			records.map((record) => pb.collection(collectionName).delete(record.id)),
		);
	}

	try {
		// Deletes data in the "guilds" collection so all the data loses their guild relation
		// Saves time & data instead of clearing every single collection
		await deleteAllFromCollection("guilds");
		return Response.json({ code: "Success" });
	} catch (_err) {
		return Response.json({ code: "Error" });
	}
}
