"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ScrapeNotification from "@/components/scrapeNotification";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DynamicUserCard from "@/components/user-search/dynamic-usercard";
import ErrorUserCard from "@/components/user-search/error-usercard";
import LoadingUserCard from "@/components/user-search/loading-usercard";
import StaticUserCard from "@/components/user-search/static-usercard";

const formSchema = z.object({
  id: z.string().min(5, {
    message: "Please enter a valid User ID",
  }),
});
export default function UserSearchPage() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

function ClientComponent() {
  const searchParams = useSearchParams();
  const guildID = searchParams.get("guildID");
  const [userData, setUserData] = useState([{ loading: false }]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(userData);

    setUserData([{ loading: true }]);
    const InputData = Array(values)[0].id;

    const DataReceived = await fetch(
      `/api/server/${guildID}/fetchUserData/${InputData}`,
    );
    const json = await DataReceived.json();
    setUserData(Array(json));
  }

  function Header() {
    return (
      <>
        <div className="mt-10 ml-10 text-2xl">User Search</div>
        <div className=" ml-10 text-sm text-white/50">
          Get details regarding any user in your Discord Server
        </div>
        <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

        <div className="mx-5 mt-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="User ID"
                          {...field}
                          className="peer pr-24"
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        className="absolute top-1/2 right-2 -translate-y-1/2 h-8 px-3 text-sm
                         opacity-0 translate-x-2 scale-95
                         transition-all duration-300 ease-in-out
                         peer-focus:opacity-100 peer-focus:translate-x-0 peer-focus:scale-100 rounded-full bg-transparent hover:bg-white/5"
                      >
                        <Search className="text-white" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <ScrapeNotification />
      </>
    );
  }

  if (userData[0].loading === true) {
    return (
      <>
        <LoadingUserCard />
      </>
    );
  }
  if (userData[0].loading === false) {
    return (
      <>
        <Header />
        <StaticUserCard />
      </>
    );
  }
  if (userData[0].userID) {
    return (
      <>
        <Header />
        <DynamicUserCard userData={userData} />
      </>
    );
  }
  return (
    <>
      <Header />
      <ErrorUserCard />
    </>
  );
}
