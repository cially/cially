"use client";

import { CircleAlert } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScrapeNotification() {
	return (
		<Suspense>
			<ClientComponent />
		</Suspense>
	);
}

function ClientComponent() {
	const [scrapeData, setScrapeData] = useState<{
		server?: string;
		noServer?: boolean;
		error?: boolean;
	}>({});

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch(`/api/cially/checkScrapeStatus`);
				const json = await response.json();
				setScrapeData(json);
				console.log(json);
			} catch (error) {
				console.error("Failed to fetch scrape data", error);
			}
		}

		fetchData();
	}, []);

	if (!scrapeData?.error && !scrapeData?.noServer && scrapeData?.server) {
		return (
			<div className="my-5 mx-5">
				<Card className="bg-amber-300/7">
					<CardHeader>
						<CardTitle>
							<CircleAlert className="-translate-y-0.5 inline mr-2" />
							Heads Up
						</CardTitle>
						<CardContent>
							It looks like{" "}
							<div className="inline text-white/80">{scrapeData.server}</div> is
							currently being scraped. To prevent conflicts, some data may be
							temporarily out of sync. Synchronization will resume automatically
							once scraping is complete, or you can restart your Discord Bot to
							stop the scraping and resume sync immediately.
						</CardContent>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return null;
}
