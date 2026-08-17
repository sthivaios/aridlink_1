"use server";

import Footer from "@/components/footer";
import { SignupForm } from "@/app/onboarding/form";
import { tryCatch } from "@/lib/try-catch";
import { checkForExistingUsers } from "@/app/onboarding/check-db";
import { refreshRouter } from "@/app/onboarding/refresh_router";
import Logo from "@/components/logo";
import React from "react";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  let existingUsers = true;

  const { data: checkData, error: checkError } = await tryCatch(
    checkForExistingUsers()
  );

  if (!checkError && !checkData) {
    existingUsers = false;
  }

  if (existingUsers) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex lg:w-[65%]">
        <div className="topographic-paper pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative">
          <Logo />
        </div>

        <div>
          <h2 className="text-2xl leading-tight font-bold tracking-tight text-balance">
            Welcome to the AridLink Irrigation Manager
          </h2>
          <div className="feathered-blur-container relative max-w-md">
            <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
              This page will help you configure an ALIM operator account. You
              can use this account to manage your entire fleet of AridLink
              stations from one console.
              <br />
              <br />
              <span className="font-bold">
                This page will disable itself once you&#39;ve created your
                account, so that nobody else can use it.
              </span>
            </p>
          </div>
        </div>

        <div className="relative">
          <Footer alignment="left" />
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            initial operator account creation wizard
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="fixed top-24 left-10 lg:hidden">
              <Logo />
            </div>

            <>
              <h1 className="text-xl font-bold tracking-tight">
                Your information
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the details for your new operator account
              </p>

              <SignupForm submitCallbackFunctionAction={refreshRouter} />
            </>
          </div>
        </div>
      </main>
    </div>
  );
}
