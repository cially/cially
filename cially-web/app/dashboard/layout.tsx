import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "../_components/_shadcn/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar isGuild={true} />
			<SidebarInset className="overflow-auto bg-transparent h-full">
				<main>
					<SidebarTrigger className="sm:hidden" />
					{children}
				</main>
				<Toaster />
			</SidebarInset>
		</SidebarProvider>
	);
}
