/** biome-ignore-all lint/a11y/noStaticElementInteractions: Theme Color Button */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Theme Color Buttons */
"use client";

import { DatabaseBackup, PaletteIcon, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { handleThemeChange } from "./_logic/setThemeFunction";
import GuestToggleCard from "./_components/guestToggle";

export default function SettingsPage() {
	const router = useRouter();

	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/cially/eraseDatabase`, {
				method: "DELETE",
			});

			if (response.ok) {
				router.push("/");
			} else {
				const errorData = await response.json();
				console.log(errorData);
			}
		} catch (error) {
			console.error("Error deleting item:", error);
		}
	};

	return (
		<>
			<div className="min-w-full min-h-dvh ">
				<div>
					<div className="text-2xl mt-4 ml-2">Settings</div>
					<div className="text-sm text-white/50 mt-1 ml-2">
						Manage your dashboard settings and preferences
					</div>
				</div>

				<Card className="mt-10 mx-3">
					<CardHeader>
						<CardTitle>
							<PaletteIcon className="inline w-5 mr-2 -translate-y-0.5" />{" "}
							Customize Theme
						</CardTitle>
						<CardDescription>
							Click to switch your current theme! Theme preferrences are saved
							in your browser.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 sm:grid-cols-4 place-self-center gap-x-5 sm:gap-x-10 gap-y-5 sm:gap-y-0">
							<div
								className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-950 via-blue-600 to-blue-850 outline-3 outline-transparent hover:outline-gray-500/40 transition-all"
								onClick={() => handleThemeChange("blue")}
							/>
							<div
								className="w-15 h-15 rounded-full bg-gradient-to-br from-pink-950 via-pink-600 to-pink-850 outline-3 outline-transparent hover:outline-gray-500/40 transition-all"
								onClick={() => handleThemeChange("pink")}
							/>
							<div
								className="w-15 h-15 rounded-full bg-gradient-to-br from-gray-950 via-gray-600 to-gray-850 outline-3 outline-transparent hover:outline-gray-500/40 transition-all"
								onClick={() => handleThemeChange("gray")}
							/>
							<div
								className="w-15 h-15 rounded-full bg-gradient-to-br from-yellow-950 via-yellow-600 to-yellow-850 outline-3 outline-transparent hover:outline-gray-500/40 transition-all"
								onClick={() => handleThemeChange("brown")}
							/>
						</div>
					</CardContent>
				</Card>

				<GuestToggleCard />

				<Card className="mt-7 mx-3">
					<CardHeader>
						<CardTitle>
							<Star className="inline w-5 mr-2 -translate-y-0.5" /> Github
							Repository
						</CardTitle>
						<CardDescription>
							Check Cially on Github for latest updates and changes! Leave a
							star if you like this project!
							<br />
							Feel free to open an issue if you experience any problems!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<a href="https://github.com/cially/cially">
							<Button variant={"outline"} className="hover:cursor-pointer bg-gray-800 text-white hover:bg-gray-800/70 transition-all">
								Github Link
							</Button>
						</a>
					</CardContent>
				</Card>

				<Card className="mx-3 mt-7 border-[1px] border-red-500/40">
					<CardHeader>
						<CardTitle>
							<DatabaseBackup className="inline w-5 mr-2 -translate-y-0.5" />{" "}
							Erase Database
						</CardTitle>
						<CardDescription>
							Click the button bellow to erase all the data in your database.
							This action is irreversible!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="destructive"
									className=" place-self-center cursor-pointer hover:outline-1 outline-0 outline-amber-950 transition-all"
								>
									Erase
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This is a permanent action. Confirming will erase all server
										data, and this process cannot be reversed. Ensure you
										understand the implications before proceeding.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => handleDelete()}
										className="bg-red-600 text-white hover:bg-red-800 transition"
									>
										Confirm
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
