import fetch from "node-fetch";

export async function GET() {
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
      await fetch(`${process.env.POCKETBASE_URL}/api/health`, {
        signal: controllerPocketbase.signal,
      });
      clearTimeout(timeoutIdPocketbase);
      response.push({ pocketbase: "online" });
    } catch (err) {
      console.log(err);

      response.push({ pocketbase: "offline" });
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/fetchGuilds`, {
        signal: controllerDiscordBot.signal,
      });
      clearTimeout(timeoutIdDiscordBot);
      response.push({ bot: "online" });
    } catch (err) {
      console.log(err);
      response.push({ bot: "offline" });
    }

    try {
      const discord_response = await fetch(
        "https://discordstatus.com/api/v2/components.json",
      );

      const data = await discord_response.json();

      const API_Component = data.components.find((c: JSON) => c.name === "API");
      const API_Status = API_Component.status;
      if (API_Status === "operational") {
        response.push({ discord: "online" });
      } else {
        response.push({ discord: "outage" });
      }
    } catch (err) {
      console.log(err);
      response.push({ discord: "offline" });
    }

    return Response.json(response);
  } catch (_error) {
    const response = [];
    response.push({ pocketbase: "offline" });
    response.push({ bot: "offline" });

    return Response.json(response);
  }
}
