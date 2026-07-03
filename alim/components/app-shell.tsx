"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  CirclePlus,
  KeyRound,
  LayoutGrid,
  LogOut,
  Settings,
} from "lucide-react";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import React, { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Fleet overview", icon: LayoutGrid },
  { href: "/dashboard/schedule", label: "Schedules", icon: CalendarClock },
  {
    href: "/dashboard/devices/new",
    label: "Register device",
    icon: CirclePlus,
  },
  { href: "/dashboard/keys", label: "API & keys", icon: KeyRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-90 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-max items-center border-b border-sidebar-border px-4 py-5">
        <Logo />
      </div>

      <nav className="flex-1 px-2 py-3">
        <p className="px-2 pb-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground/70 uppercase">
          Operations
        </p>
        <ul className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 border border-transparent px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "border-sidebar-border bg-card font-medium text-foreground"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4", active ? "text-primary" : "")}
                    strokeWidth={2}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        <div className="border border-border bg-card px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Instance
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-foreground">
            alim.local - v0.9.2
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2.5 border border-transparent px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Sign out
        </Link>
      </div>
    </aside>
  );
}

export function Topbar() {
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayPassed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const showLoading = isPending || !minDelayPassed;

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full flex-row items-center justify-end gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <div className="pr-10">
        <AnimatePresence mode="wait">
          {showLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-row items-center gap-2"
            >
              <Spinner height={15} width={15} />
              <p>Loading...</p>
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-end justify-end"
            >
              <p className="font-mono text-[13px] leading-tight text-foreground">
                {session?.user.name}
              </p>
              <p className="font-mono text-[10px] leading-tight text-muted-foreground">
                OPERATOR
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
