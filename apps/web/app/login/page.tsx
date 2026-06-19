"use client";

import { Suspense, useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import LoadingSVG from "@/components/loading-page";

export default function MessagesActivityPage() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

interface AccountData {
  adminAccountExists: boolean | null,
  responseCode: number

}

function ClientComponent() {
  const [userData, setUserData] = useState<AccountData | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { checkForAdminAccountsAction } = await import("@/components/actions/checkForAdminAccounts");
      const json = await checkForAdminAccountsAction();
      setUserData(json as AccountData);
    }
    fetchData();
  }, []);

  if (userData) {

    if (userData.adminAccountExists === true) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      );
    }

    if (userData.adminAccountExists === false) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      );
    }

    return "Error";
  }
  return (
    <div className="place-self-center">
      <LoadingSVG />
    </div>
  );
}
