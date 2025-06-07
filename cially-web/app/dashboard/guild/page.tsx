"use client";

import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GuildNotFound from "../../_components/_events/guildNotFound";
import LoadingSVG from "../../_components/_events/loading-page";

function ClientComponent() {
	const searchParams = useSearchParams();
	const guildID = searchParams.get("guildID");
	const [chartData, setChartData] = useState([{ amount: 69 }]);

	useEffect(() => {
		async function fetchData() {
			const chartDataReceived = await fetch(
				`/api/server/${guildID}/fetchGuild`,
			);
			const json = await chartDataReceived.json();
			setChartData(json);
		}
		fetchData();
	}, [guildID]);

	if (chartData.notFound) {
		return <GuildNotFound />;
	} else if (!chartData.guildFound) {
		return <LoadingSVG />;
	} else {
		redirect(`server/info?guildID=${guildID}`);
	}
}

export default function DataDashboard() {
	return (
		<Suspense fallback={<LoadingSVG />}>
			<ClientComponent />
		</Suspense>
	);
}
