"use client";

import { LoginForm } from "./_components/login-form";
import { RegisterForm } from "./_components/register-form";
import { Suspense, useEffect, useState } from "react";
import LoadingSVG from "../_components/_events/loading-page";

export default function MessagesActivityPage() {
	return (
		<Suspense>
			<ClientComponent />
		</Suspense>
	);
}

function ClientComponent() {
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		async function fetchData() {
			const chartDataReceived = await fetch(
				`/api/cially/checkForAdminAccounts`,
			);
			const json = await chartDataReceived.json();
			setUserData(json);
		}
		fetchData();
	}, []);

	if (userData) {
		if (userData.account) {
			return (
				<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
					<div className="w-full max-w-sm">
						<LoginForm />
					</div>
				</div>
			);
		} else if (userData.noAccounts) {
			return (
				<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
					<div className="w-full max-w-sm">
						<RegisterForm />
					</div>
				</div>
			);
		}
		return <>Error</>;
	} else {
		return (
			<div className="place-self-center">
				<LoadingSVG />
			</div>
		);
	}
}
