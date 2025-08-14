import { AppSidebar } from "@/components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar isGuild={false} />
      <SidebarInset className="h-full overflow-auto bg-transparent">
        <main>
          <SidebarTrigger className="" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
