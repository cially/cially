import fetch from "node-fetch";

// Main GET Event
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const response = [];

		const controllerPocketbase = new AbortController();
		const controllerDiscordBot = new AbortController();
		const timeoutIdPocketbase = setTimeout(
			() => controllerPocketbase.abort(),
			5000,
		);
		const timeoutIdDiscordBot = setTimeout(
			() => controllerDiscordBot.abort(),
			5000,
		);

		try {
			const pocketbase_response = await fetch(
				`${process.env.POCKETBASE_URL}/api/health`,
				{ signal: controllerPocketbase.signal },
			);
			clearTimeout(timeoutIdPocketbase);
			response.push({ pocketbase: "online" });
		} catch (err) {
			console.log(err);

			response.push({ pocketbase: "offline" });
		}

		try {
			const bot_response = await fetch(
				`${process.env.NEXT_PUBLIC_BOT_API_URL}/fetchGuilds`,
				{ signal: controllerDiscordBot.signal },
			);
			clearTimeout(timeoutIdDiscordBot);
			response.push({ bot: "online" });
		} catch (err) {
			console.log(err);
			response.push({ bot: "offline" });
		}

		return Response.json(response);
	} catch (error) {
		const response = [];
		response.push({ pocketbase: "offline" });
		response.push({ bot: "offline" });

		return Response.json(response);
	}
}
