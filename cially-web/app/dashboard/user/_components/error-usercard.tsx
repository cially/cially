"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ErrorUserCard() {
	return (
		<div className="place-self-center w-full mt-3 ">
			<Card className="mx-5">
				<CardHeader>
					<div className="grid grid-cols-2">
						<div className="place-self-start">
							<div className="grid grid-cols-2 gap-0">
								<Avatar className="w-15 h-15">
									<Skeleton className="w-full rounded-full " />
								</Avatar>
								<div className="place-self-center font-bold">
									<Skeleton className="w-20 h-5 rounded-xl " />
								</div>
							</div>
						</div>
					</div>

					<hr className="my-3" />
				</CardHeader>
				<CardContent>
					<Skeleton className="w-full h-20 rounded-xl " />
				</CardContent>
			</Card>
			<div className="mx-20 mt-5">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						<p className="text-gray-500 text-xs">
							Could not find that user in the database!
						</p>
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}
