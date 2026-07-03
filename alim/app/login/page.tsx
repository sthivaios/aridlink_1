"use client";

import { Droplets } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";
import Footer from "@/components/footer";
import LoggedInStuff from "@/app/login/logged-in-stuff";
import { useEffect, useState } from "react";
import LoginForm from "@/app/login/login-form";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex lg:w-[65%]">
        <div className="topographic-paper pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative flex flex-row items-center gap-2.5">
          <Image
            src="/aridlink_logo.png"
            alt="The AridLink Logo"
            width={50}
            height={50}
          ></Image>
          <div className="leading-tight">
            <div className="font-mono text-xl font-bold tracking-tight">
              ALIM
            </div>
            <div className="font-mono text-[13px] tracking-[0.14em] text-muted-foreground uppercase">
              AridLink Irrigation Manager
            </div>
          </div>
        </div>

        <div className="feathered-blur-container relative max-w-md">
          <h2 className="font-mono text-2xl leading-tight font-bold tracking-tight text-balance">
            Welcome back to ALIM
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
            Provision, configure, and monitor your entire fleet of AridLink
            stations from one console.
          </p>
        </div>

        <div className="relative">
          <Footer alignment="left" />
        </div>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Operator sign-in
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
                  <Droplets className="h-4.5 w-4.5" strokeWidth={2.5} />
                </div>
                <div className="font-mono text-sm font-bold tracking-tight">
                  ALIM
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-row items-center justify-center gap-6 font-mono text-xl"
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
                  <h1 className="mb-4 font-mono text-xl font-bold tracking-tight">
                    Authenticate
                  </h1>
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
