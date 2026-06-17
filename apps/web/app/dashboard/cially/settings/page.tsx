/** biome-ignore-all lint/a11y/noStaticElementInteractions: Theme Color Button */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Theme Color Buttons */
"use client";

import { DatabaseBackup, Heart, PaletteIcon, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GuestToggleCard from "@/components/settings/guestToggle";
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
import SignOut from "./_logic/signOutHandler";

export default function SettingsPage() {
  const router = useRouter();
  const [isGuest, setGuestStatus] = useState(true);

  useEffect(() => {
    async function getGuestCookie() {
      const guestStatus = document.cookie
        .split("; ")
        .find((row) => row.startsWith("guest="))
        ?.split("=")[1];
      if (guestStatus !== "true") {
        setGuestStatus(false);
      }
    }
    getGuestCookie();
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/cially/eraseDatabase", {
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

  const handleSignOut = async () => {
    try {
      SignOut();

      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleThemeUpdate = async (theme: string) => {
    await handleThemeChange(theme);
    router.refresh();
  };

  return (
    <div className="min-h-dvh min-w-full ">
      <div>
        <div className="mt-4 ml-2 text-2xl">Settings</div>
        <div className="mt-1 ml-2 text-sm text-white/50">
          Manage your dashboard settings and preferences
        </div>
      </div>

      <Card className="mx-3 mt-10">
        <CardHeader>
          <CardTitle>
            <PaletteIcon className="-translate-y-0.5 mr-2 inline w-5" />{" "}
            Customize Theme
          </CardTitle>
          <CardDescription>
            Click to switch your current theme! Theme preferrences are saved in
            your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-5 gap-y-5 place-self-center sm:grid-cols-6 sm:gap-x-10 sm:gap-y-0">
            <div
              className="h-15 w-15 hover:cursor-pointer rounded-full bg-gradient-to-br from-blue-950 via-blue-600 to-blue-850 outline-3 outline-transparent transition-all hover:outline-gray-500/40"
              onClick={() => handleThemeUpdate("blue")}
            />
            <div
              className="h-15 w-15 hover:cursor-pointer rounded-full bg-gradient-to-br from-pink-950 via-pink-600 to-pink-850 outline-3 outline-transparent transition-all hover:outline-gray-500/40"
              onClick={() => handleThemeUpdate("pink")}
            />
            <div
              className="h-15 w-15 hover:cursor-pointer rounded-full bg-gradient-to-br from-gray-950 via-gray-600 to-gray-850 outline-3 outline-transparent transition-all hover:outline-gray-500/40"
              onClick={() => handleThemeUpdate("gray")}
            />
            <div
              className="h-15 w-15 hover:cursor-pointer rounded-full bg-gradient-to-br from-yellow-950 via-yellow-600 to-yellow-850 outline-3 outline-transparent transition-all hover:outline-gray-500/40"
              onClick={() => handleThemeUpdate("brown")}
            />
            <div
              className="h-15 w-15 hover:cursor-pointer rounded-full bg-gradient-to-br from-purple-950 via-purple-600 to-purple-850 outline-3 outline-transparent transition-all hover:outline-gray-500/40"
              onClick={() => handleThemeUpdate("purple")}
            />
            <div
              className="h-15 w-15 hover:cursor-pointer rounded-full bg-gradient-to-br from-red-950 via-red-600 to-red-850 outline-3 outline-transparent transition-all hover:outline-gray-500/40"
              onClick={() => handleThemeUpdate("red")}
            />
          </div>
        </CardContent>
      </Card>
      {isGuest ? (
        <div className="hidden" />
      ) : (
        <div className="grid sm:grid-cols-2">
          <GuestToggleCard />

          <Card className="mx-3 mt-7 flex flex-col border-[1px] border-red-500/40">
            <CardHeader>
              <CardTitle>
                <DatabaseBackup className="-translate-y-0.5 mr-2 inline w-5" />{" "}
                Erase Database
              </CardTitle>
              <CardDescription>
                Click the button bellow to erase all the data in your database.
                This action is irreversible!
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex justify-center pb-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className=" cursor-pointer place-self-center outline-0 outline-amber-950 transition-all hover:outline-1"
                    variant="destructive"
                  >
                    Erase
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This is a permanent action. Confirming will erase all
                      server data, and this process cannot be reversed. Ensure
                      you understand the implications before proceeding.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 text-white transition hover:bg-red-800"
                      onClick={() => handleDelete()}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mx-3 mt-7">
        <CardHeader>
          <CardTitle>
            <Star className="-translate-y-0.5 mr-2 inline w-5" /> Github
            Repository
          </CardTitle>
          <CardDescription>
            Check Cially on Github for latest updates and changes! Leave a star
            if you like this project!
            <br />
            Feel free to open an issue if you experience any problems!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center sm:justify-start">
          <a href="https://github.com/cially/cially">
            <Button
              className="bg-gray-800 text-white transition-all hover:cursor-pointer hover:bg-gray-800/70"
              variant={"outline"}
            >
              Github Link
            </Button>
          </a>
        </CardContent>
      </Card>

      <div className="mt-5 place-self-center">
        <Button
          className="hover:cursor-pointer"
          onClick={() => handleSignOut()}
          variant={"outline"}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
