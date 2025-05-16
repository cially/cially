import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DataDashboard() {
	const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || "http://cially-bot:3001"


	try {
		let guildData = [{ amount: 69 }];
		const data = await fetch(`${BOT_API_URL}/fetchGuilds`);
		const dataJSON = data ? await data.json() : [{ error: "cant communicate" }];
		guildData = dataJSON;

		if (!guildData.AvailableGuilds) {
			return (
				<>
					<div className="w-20 place-self-center">
						<img src="/logo-png.png" alt="logo"/>
					</div>
					<div className="text-2xl  text-center">Available Guilds</div>
					<div className="text-sm text-gray-400 text-center">
						Please Select the Guild you would like to view
					</div>

					<div className="mb-10" />

					<div className={`grid gap-y-5 grid-cols-1 sm:grid-cols-3 mx-10`}>
						<Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
						<Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
						<Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
					</div>

					<div className="text-center mt-15 text-xs text-gray-600 pb-5">
						Thanks for using Cially Dashboard!
					</div>
				</>
			);
		}
		const guildDataArray = guildData.AvailableGuilds;
		const guildLength = guildDataArray.length;
		const grid_column_number = guildLength > 2 ? 3 : guildLength > 1 ? 2 : 1;
		const gridClass = {
			1: "sm:grid-cols-1",
			2: "sm:grid-cols-2",
			3: "sm:grid-cols-3",
		}[grid_column_number];

		const guildCards = guildDataArray.map((guild) =>
			guild.in_db === true ? (
				<a
					href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/guild?guildID=${guild.id}`}
					key={guild.id}
				>
					<Card className="hover:bg-white/2 transition-all mx-5">
						<CardHeader className="place-items-center">
							<Avatar className=" w-20 h-20">
								<AvatarImage src={guild.icon} />
								<AvatarFallback>Guild</AvatarFallback>
							</Avatar>
							<CardTitle className="mt-5">{guild.name}</CardTitle>
						</CardHeader>
					</Card>
				</a>
			) : (
				<TooltipProvider key={guild.id}>
					<Tooltip>
						<TooltipTrigger>
							<Card className="bg-red-400/10 hover:bg-red-400/7 transition-all mx-5 cursor-not-allowed">
								<CardHeader className="place-items-center">
									<Avatar className=" w-20 h-20">
										<AvatarImage src={guild.icon} />
										<AvatarFallback>Guild</AvatarFallback>
									</Avatar>
									<CardTitle className="mt-5">{guild.name}</CardTitle>
								</CardHeader>
							</Card>
						</TooltipTrigger>
						<TooltipContent className="text-white">
							<p>
								There is not enough data for this server! Please let the bot
								fetch some data and try again later!
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
		);

		return (
			<>
				<div className="w-20 place-self-center">
					<img src="/logo-png.png" alt="logo" />
				</div>
				<div className="text-2xl  text-center">Available Guilds</div>
				<div className="text-sm text-gray-400 text-center">
					Please Select the Guild you would like to view
				</div>

				<div className="mb-10" />
				<div className={`grid gap-y-5 grid-cols-1 ${gridClass} mx-10`}>
					{guildCards}
				</div>

				<div className="text-center mt-15 text-xs text-gray-600 pb-5">
					Thanks for using Cially Dashboard!
				</div>
			</>
		);
	} catch (err) {
		const error = err.toString();

		// TODO add this error screen to every place where fetching occurs

		return (
			<>
				<div className="w-20 place-self-center">
					<img src="/logo-png.png" alt="logo" />
				</div>
				<div className="text-center mx-5">
					Looks like the Discord Bot can't communicate with the Dashboard.
					<br />
					Please make sure that you followed the setup instructions correctly
					and that the bot is up and running! <br />
					<br />
					Are you facing other issues? Check our GitHub and seek support!
					<br />
					<a
						href="https://github.com/skellgreco/cially"
						className="text-blue-400 underline"
					>
						GitHub Redirect
					</a>
					<br />
					<br />
					<div>Error {err.name}</div>
					<div>{error}</div>
				</div>
			</>
		);
	}
}
