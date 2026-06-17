"use client";

import {
  Bolt,
  ChartLine,
  Home,
  House,
  Inbox,
  SatelliteDish,
  Smile,
  UserSearch,
  Bot,
  Info,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ isGuild }: { isGuild: boolean }) {
  return (
    <Suspense>
      <ClientComponent isGuild={isGuild} />
    </Suspense>
  );
}

function ClientComponent({ isGuild }: { isGuild: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [availableUpdate, setAvailableUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function compareVersions() {
      const response = await fetch("/api/cially/checkForUpdates", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      if (data.code == 200) {
        if (data.response.isUpdateAvailable) {
          setAvailableUpdate(true);
          setLatestVersion(data.response.latestVersion);
        }
        setCurrentVersion(data.response.currentVersiosn);
      }
    }
    compareVersions();

    const guestStatus = document.cookie
      .split("; ")
      .find((row) => row.startsWith("guest="))
      ?.split("=")[1];
    if (guestStatus === "true") {
      setIsGuest(true);
    }
  }, []);

  const guildID = searchParams ? searchParams.get("guildID") : "error";

  const items = [
    {
      title: "General",
      url: `/dashboard/server/info?guildID=${guildID}`,
      icon: Home,
      path: "/dashboard/server/info",
    },
    {
      title: "Messages",
      url: `/dashboard/server/messages?guildID=${guildID}`,
      icon: Inbox,
      path: "/dashboard/server/messages",
    },
    {
      title: "Activity",
      url: `/dashboard/server/activity?guildID=${guildID}`,
      icon: Smile,
      path: "/dashboard/server/activity",
    },
    {
      title: "Growth",
      url: `/dashboard/server/growth?guildID=${guildID}`,
      icon: ChartLine,
      path: "/dashboard/server/growth",
    },
    {
      title: "User Search",
      url: `/dashboard/server/user?guildID=${guildID}`,
      icon: UserSearch,
      path: "/dashboard/server/user",
    },
  ];

  // Cially items
  const cially_items = [
    {
      title: "Home",
      url: "/dashboard",
      icon: House,
      path: "/dashboard",
    },
    {
      title: "Settings",
      url: "/dashboard/cially/settings",
      icon: Bolt,
      path: "/dashboard/cially/settings",
    },
    {
      title: "Status",
      url: "/dashboard/cially/status",
      icon: SatelliteDish,
      path: "/dashboard/cially/status",
    },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === itemPath;
  };

  return (
    <Sidebar className="border border-white/0 sm:bg-white/3 sm:backdrop-blur-2xl">
      <SidebarHeader>
        <a href="/dashboard">
          <Image
            alt="logo"
            className="w-20 place-self-center"
            height={500}
            src="/logo-webp.webp"
            width={500}
          />
        </a>
      </SidebarHeader>
      <SidebarContent>
        {isGuild ? (
          <div className=" mb-8">
            <SidebarGroupLabel className="ml-1">
              Server Analytics
            </SidebarGroupLabel>
            <SidebarGroupContent className="ml-3 w-50">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem
                    className={`rounded-sm from-white/0 to-white/10 transition-all hover:bg-linear-to-r ${
                      isActive(item.path)
                        ? "border-gray-400 border-0 bg-linear-to-r from-white/2 to-white/10"
                        : ""
                    }`}
                    key={item.title}
                  >
                    <SidebarMenuButton asChild>
                      <a
                        className={isActive(item.path) ? "" : ""}
                        href={item.url}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        ) : (
          <div />
        )}

        <SidebarGroupLabel className="ml-1">Dashboard</SidebarGroupLabel>
        <SidebarGroupContent className="ml-3 w-50">
          <SidebarMenu>
            {cially_items.map((item) => (
              <SidebarMenuItem
                className={`rounded-sm from-white/0 to-white/10 transition-all hover:bg-gradient-to-r ${
                  isActive(item.path)
                    ? "border-gray-400 border-l-0 bg-gradient-to-r from-white/2 to-white/10"
                    : ""
                }`}
                key={item.title}
              >
                <SidebarMenuButton asChild>
                  <a className={isActive(item.path) ? "" : ""} href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter className="place-items-center pb-4">
        {availableUpdate && !isGuest && (
          <div className="mx-4 mb-4 p-4 rounded-xl bg-white/3 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white/90">
                Update Available
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              A new version ({latestVersion}) of Cially is available for
              download.
            </p>
            <a
              className="mt-3 inline-block text-xs font-medium text-white transition-colors"
              href="https://github.com/skellgreco/cially/releases"
              rel="noreferrer"
              target="_blank"
            >
              Check Release →
            </a>
          </div>
        )}
        <a href="https://github.com/skellgreco/cially">
          <Badge
            className="rounded-full text-white/70 bg-white/10 backdrop-blur-lg"
            variant="secondary"
          >
            Version: {currentVersion}
          </Badge>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
