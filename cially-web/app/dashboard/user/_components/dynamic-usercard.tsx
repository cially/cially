"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DynamicUserCard({ userData }) {
	return (
		<div className="place-self-center w-full mt-10 ">
			<Card className="mx-5">
				<CardHeader>
					<div className="grid grid-cols-2">
						<div className="place-self-start">
							<div className="grid grid-cols-2 gap-0">
								<Avatar className="w-15 h-15">
									<AvatarImage src={userData[0].avatar} />
								</Avatar>
								<div className="place-self-center font-bold">
									{userData[0].username}
								</div>
							</div>
						</div>
					</div>

					<hr className="my-3" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3">
						<div className="place-self-start">
							<div>
								Joins:{" "}
								<div className="inline text-gray-300">
									{userData[0].dataArray[0].totalJoins}
								</div>
							</div>
							<div>
								Leaves:{" "}
								<div className="inline text-gray-300">
									{userData[0].dataArray[0].totalLeaves}
								</div>
							</div>
							<div>
								Total Messages:{" "}
								<div className="inline text-gray-300">
									{userData[0].dataArray[0].totalMessages}
								</div>
							</div>
							<div>
								Creation Date:{" "}
								<div className="inline text-gray-300">
									{userData[0].creationDate.slice(0, 10)} at{" "}
									{userData[0].creationDate.slice(11, 19)} UTC
								</div>
							</div>
						</div>
						<div className="place-self-start">
							<div>
								Average Message Length:{" "}
								<div className="inline text-gray-300">
									{userData[0].dataArray[0].averageMessageLength}
								</div>
							</div>
							<div>
								Invites Created:{" "}
								<div className="inline text-gray-300">
									{userData[0].dataArray[0].totalInvites}
								</div>
							</div>
							<div>
								Most Active Channel:{" "}
								<div className="inline text-gray-300">
									#{userData[0].dataArray[0].activeChannel[0].channel}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
