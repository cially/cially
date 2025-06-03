"use client";

import { Suspense, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, Activity } from "lucide-react";

export default function MessagesDashboard() {
	return (
		<Suspense>
			<ClientComponent />
		</Suspense>
	);
}

function ClientComponent() {
	const [guildData, setGuildData] = useState([{ amount: 0 }]);

	useEffect(() => {
		async function fetchData() {
			const DataReceived = await fetch(`/api/fetchGuilds`);
			const json = await DataReceived.json();
			setGuildData(json.data);
			console.log(json);
		}
		fetchData();
	}, []);

	try {
		console.log(guildData);
		if (!guildData.AvailableGuilds) {
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

					<div className="grid gap-y-5 grid-cols-1 sm:grid-cols-3 mx-10">
						<Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
						<Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
						<Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
					</div>

					<div className="self-center mt-10">
						<div className="grid grid-cols-3 place-self-center gap-x-5 mt-10 text-gray-400 ">
							<div className="rounded-full w-6 ">
								<a href="/cially/settings">
									<Settings className="w-7 place-self-center hover:text-gray-600 transition-all" />
								</a>
							</div>

							<div className="rounded-full w-6">
								<a href="/cially/status">
									<Activity className="w-7 place-self-center hover:text-gray-600 transition-all" />
								</a>
							</div>

							<div className="rounded-full w-6">
								<a href="https://github.com/cially/cially">
									<img
										src="/github.svg"
										alt="github"
										className="w-7 place-self-center grayscale-0 brightness-[1] hover:brightness-[0.55] transition-all"
									/>
								</a>
							</div>
						</div>
						<div className="text-center mt-5 text-xs text-gray-600 pb-5">
							Thanks for using Cially Dashboard!
						</div>
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
				<a href={`/guild?guildID=${guild.id}`} key={guild.id}>
					<Card className="hover:bg-white/2 transition-all mx-5">
						<CardHeader className="place-items-center">
							<Avatar className=" w-20 h-20">
								<AvatarImage src={guild.icon} />
								<AvatarFallback>Guild</AvatarFallback>
							</Avatar>
							<CardTitle className="mt-5 text-center">{guild.name}</CardTitle>
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

				<div className="self-center mt-10">
					<div className="grid grid-cols-3 place-self-center gap-x-5 mt-10 text-gray-400 ">
						<div className="rounded-full w-6 ">
							<a href="/cially/settings">
								<Settings className="w-7 place-self-center hover:text-gray-600 transition-all" />
							</a>
						</div>

						<div className="rounded-full w-6">
							<a href="/cially/status">
								<Activity className="w-7 place-self-center hover:text-gray-600 transition-all" />
							</a>
						</div>

						<div className="rounded-full w-6">
							<a href="https://github.com/cially/cially">
								<img
									src="/github.svg"
									alt="github"
									className="w-7 place-self-center grayscale-0 brightness-[1] hover:brightness-[0.55] transition-all"
								/>
							</a>
						</div>
					</div>
					<div className="text-center mt-5 text-xs text-gray-600 pb-5">
						Thanks for using Cially Dashboard!
					</div>
				</div>
			</>
		);
	} catch (err) {
		const error = err.toString();
		console.log(err);
		return (
			<>
				<div className="w-20 place-self-center">
					<img src="/logo-png.png" alt="logo" />
				</div>
				<div className="text-center mx-5">
					Looks like the Discord Bot can't communicate with the Dashboard.
					<br />
					Please make sure that you followed the setup instructions correctly
					and that the bot is up and running!
					<br />
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
				<div className="self-center mt-10">
					<div className="grid grid-cols-3 place-self-center gap-x-5 mt-10 text-gray-400 ">
						<div className="rounded-full w-6 ">
							<a href="/cially/settings">
								<Settings className="w-7 place-self-center hover:text-gray-600 transition-all" />
							</a>
						</div>

						<div className="rounded-full w-6">
							<a href="/cially/status">
								<Activity className="w-7 place-self-center hover:text-gray-600 transition-all" />
							</a>
						</div>

						<div className="rounded-full w-6">
							<a href="https://github.com/cially/cially">
								<img
									src="/github.svg"
									alt="github"
									className="w-7 place-self-center grayscale-0 brightness-[1] hover:brightness-[0.55] transition-all"
								/>
							</a>
						</div>
					</div>
					<div className="text-center mt-5 text-xs text-gray-600 pb-5">
						Thanks for using Cially Dashboard!
					</div>
				</div>
			</>
		);
	}
}
