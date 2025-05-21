import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BottomCard({ guild }) {
	const correct_date =
		guild.creation_date.slice(0, 4) +
		"/" +
		guild.creation_date.slice(5, 7) +
		"/" +
		guild.creation_date.slice(11, 13);
	const correct_available = guild.available === "true" ? "Yes" : "No";
	const partner_correct = guild.discord_partner === "true" ? "Yes" : "No";
	const correct_description = guild.description
		? guild.description
		: "No Description";
	const correct_vanity_url = guild.vanity_url
		? `discord.gg/${guild.vanity_url}`
		: "No Vanity URL";
	const correct_vanity_uses = guild.vanity_uses
		? guild.vanity_uses !== -1
			? guild.vanity_uses
			: "No Permissions to View"
		: "-";

	return (
		<>
			<Card className="mt-10 grid grid-rows-1 px-10 sm:min-w-dvh sm:grid-cols-5 sm:grid-rows-1">
				<div className="col-start-1 h-20 w-20 place-self-center sm:col-span-1 sm:place-self-auto">
					<Avatar className=" h-20 w-20">
						<AvatarImage src={guild.icon_url} />
						<AvatarFallback>Guild</AvatarFallback>
					</Avatar>
				</div>

				<div className="grid grid-rows-1 text-center sm:col-span-2 sm:text-left">
					<div>
						<div className="text-2xl">{guild.name}</div>
						<div className="mb-10 text-gray-400 text-xs">
							{correct_description}
						</div>
					</div>
					<div className="">
						Members: {guild.members}
						<br />
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>Available: {correct_available}</TooltipTrigger>
								<TooltipContent>
									<p>
										If a server is not available, it means it’s down or in an
										outage
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<br />
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>Partnered: {partner_correct}</TooltipTrigger>
								<TooltipContent>
									<p>
										Shows if the server belongs to the Discord Partner Program
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<br />
						Created: {correct_date}
						<br />
						Owner: {guild.owner_username}
					</div>
				</div>

				<div className="mt-5 grid grid-rows-1 text-center sm:col-span-2 sm:mt-0 sm:text-left">
					<div>
						<div className="text-2xl" />
						<div className="text-gray-400 text-xs" />
					</div>
					<div className="">
						Channels: {guild.channels}
						<br />
						Roles: {guild.roles}
						<br />
						Bans: {guild.bans}
						<br />
						Vanity URL: {correct_vanity_url}
						<br />
						Vanity Uses: {correct_vanity_uses}
					</div>
				</div>
			</Card>
		</>
	);
}
