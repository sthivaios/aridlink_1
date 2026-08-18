"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Footer from "@/components/footer";
import LoggedInStuff from "@/app/(main_app)/login/logged-in-stuff";
import { useEffect, useState } from "react";
import LoginForm from "@/app/(main_app)/login/login-form";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/logo";

export default function LoginPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  async function handleSingOut() {
    await authClient.signOut();
    toast.success("Logout successful!");
    setAuthenticated(false);
  }

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayPassed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const showLoading = isPending || !minDelayPassed;

  const isAuthenticated = !!session || authenticated;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex lg:w-[72.5%]">
        <div className="bg-tomatos pointer-events-none absolute inset-0" />

        <div className="relative">
          <Logo
            textColors={{
              title: "text-white",
              caption: "text-white/80",
            }}
          />
        </div>

        <div className="feathered-blur-container relative max-w-md">
          <h2 className="text-2xl font-bold tracking-tight text-balance text-white">
            Welcome back to ALIM
          </h2>
          <p className="mt-3 text-sm leading-tight font-bold text-pretty text-white/80">
            Provision, configure, and monitor your entire fleet of AridLink
            stations from one console.
          </p>
        </div>

        <div className="relative flex flex-col gap-2">
          <Footer alignment="left" textColor="text-white" />
          <p className="text-xs text-white italic">
            Picture © Stratos Thivaios 2026 - All Rights Reserved
          </p>
        </div>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Operator sign-in
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>

            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-row items-center justify-center gap-6 text-xl"
                >
                  <Spinner className="h-8 w-8" />
                  <p>Loading...</p>
                </motion.div>
              ) : isAuthenticated ? (
                <motion.div
                  key="loggedin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoggedInStuff
                    session={session}
                    signOutCallback={handleSingOut}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="loginform"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4 flex flex-col gap-0">
                    <h1 className="text-xl font-bold tracking-tight">
                      Authenticate
                    </h1>
                    <p>Log into your ALIM account</p>
                  </div>
                  <LoginForm setAuthenticatedCallback={setAuthenticated} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
