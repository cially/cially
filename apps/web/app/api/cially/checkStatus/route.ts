import fetch from "node-fetch";

export async function GET() {
  try {
    const response = [];

    let discordStatus: string;
    let botStatus: string;
    let pbStatus: string;

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
      pbStatus = "online";
    } catch (err) {
      console.log(err);

      pbStatus = "offline";
    }

    try {
      await fetch(`${process.env.API_URL}/fetchGuilds`, {
        signal: controllerDiscordBot.signal,
      });
      clearTimeout(timeoutIdDiscordBot);
      botStatus = "online";
    } catch (err) {
      console.log(err);
      botStatus = "offline";
    }

    try {
      const discord_response = await fetch(
        "https://discordstatus.com/api/v2/components.json",
      );

      const data: any = await discord_response.json();

      const API_Component = data.components.find((c: any) => c.name === "API");
      const API_Status = API_Component.status;
      if (API_Status === "operational") {
        discordStatus = "online";
      } else {
        discordStatus = "offline";
      }
    } catch (err) {
      console.log(err);
      discordStatus = "offline";
    }

    return Response.json({
      pocketbase: pbStatus,
      bot: botStatus,
      discord: discordStatus,
    });
  } catch (_error) {
    const response = [];
    response.push({ pocketbase: "offline" });
    response.push({ bot: "offline" });

    return Response.json(response);
  }
}
