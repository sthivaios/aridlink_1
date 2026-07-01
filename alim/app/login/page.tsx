"use client";

import Link from "next/link";
import { Droplets, ArrowRight, UserCheck, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function clearFields() {
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { error } = await authClient.signIn.email({
      email: email,
      password: password,
    });

    if (!error) {
      clearFields();
      setAuthenticated(true);
      toast.success("Authentication successful!");
    } else {
      toast.error(error.message);
    }
  }

  async function handleSingOut() {
    await authClient.signOut();
    clearFields();
    toast.success("Logout successful!");
    setAuthenticated(false);
  }

  const { data: session, isPending } = authClient.useSession();

  const isAuthenticated = !!session || authenticated;

  // if (isPending) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex lg:w-[44%]">
        <div className="grid-paper pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative flex flex-row items-center gap-2.5">
          <Image src="/aridlink_logo.png" alt="The AridLink Logo" width={50} height={50}></Image>
          <div className="leading-tight">
            <div className="font-mono text-xl font-bold tracking-tight">
              ALIM
            </div>
            <div className="font-mono text-[13px] tracking-[0.14em] text-muted-foreground uppercase">
              AridLink Irrigation Manager
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-mono text-2xl leading-tight font-bold tracking-tight text-balance">
            Welcome back to ALIM
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
            Provision, configure, and monitor your entire fleet of AridLink
            stations from one console.
          </p>
        </div>

        <div className="relative flex flex-col items-start justify-center gap-2 font-mono text-[13px] text-muted-foreground">
          <span>AridLink Irrigation Manager v0.9.2</span>
          <span className="font-bold">
            Copyright © 2026 Stratos Thivaios<br/>ALIM is free software under the{" "}
            <Link className="text-blue-400 hover:underline hover:text-foreground transition-all duration-200" href="https://www.gnu.org/licenses/agpl-3.0.html">
              GNU Affero General Public License v3
            </Link>
          </span>
        </div>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Operator sign-in
          </span>
          <ThemeToggle />
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

            {!isAuthenticated ? (
              <>
                <h1 className="font-mono text-xl font-bold tracking-tight">
                  Authenticate
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to access the fleet console.
                </p>
              </>
            ) : null}

            {isAuthenticated ? (
              <div className="mt-8 flex flex-col items-center space-y-4">
                <UserCheck color="teal"></UserCheck>
                <div className="flex w-full flex-col items-center justify-center">
                  <p>Welcome back, {session?.user.name}!</p>
                  <p>You have authenticated successfully.</p>
                </div>
                <p>Your available options:</p>
                <Link
                  href="/dashboard"
                  className="flex h-10 w-full items-center justify-center gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Head to dashboard
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
                <Button
                  variant="outline"
                  className="flex h-10 w-full items-center justify-center gap-2 font-mono text-sm font-semibold"
                  onClick={handleSingOut}
                >
                  Logout
                  <LogOut className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            ) : (
              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    Operator ID / email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="field-admin@alim.local"
                    className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
                    >
                      Password
                    </label>
                    {/*<span className="font-mono text-[11px] text-primary hover:underline">*/}
                    {/*  Reset*/}
                    {/*</span>*/}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
                  />
                </div>

                <Button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Authenticate
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </form>
            )}

            {/*<div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>*/}
          </div>
        </div>
      </main>
    </div>
  );
}
