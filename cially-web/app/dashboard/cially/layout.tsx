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
      <SidebarInset className="overflow-auto bg-transparent h-full">
        <main>
          <SidebarTrigger className="sm:hidden" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
