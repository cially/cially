"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StaticUserCard() {
	return (
		<div className="place-self-center w-full mt-10 ">
			<Card className="mx-5">
				<CardHeader>
					<div className="grid grid-cols-2">
						<div className="place-self-start">
							<div className="grid grid-cols-2 gap-0">
								<Avatar className="w-15 h-15">
									<AvatarImage src="https://cdn.discordapp.com/embed/avatars/2.png" />
								</Avatar>
								<div className="place-self-center font-bold">Example User</div>
							</div>
						</div>
					</div>

					<hr className="my-3" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3">
						<div className="place-self-start">
							<div>
								Joins: <div className="inline text-gray-300">3</div>
							</div>
							<div>
								Leaves: <div className="inline text-gray-300">2</div>
							</div>
							<div>
								Total Messages: <div className="inline text-gray-300">129</div>
							</div>
						</div>
						<div className="place-self-start">
							<div>
								Average Message Length:{" "}
								<div className="inline text-gray-300">6</div>
							</div>
							<div>
								Invites Created: <div className="inline text-gray-300">10</div>
							</div>
							<div>
								Creation Date:{" "}
								<div className="inline text-gray-300">
									2023-10-2 at 18:29:02 UTC
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
