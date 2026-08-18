import React from "react";
import { ArrowRight, LogOut, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Session = typeof authClient.$Infer.Session;

function LoggedInStuff(props: {
  session: Session | null;
  signOutCallback: () => void;
}) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <UserCheck color="#00588A" height={50} width={50}></UserCheck>
      <div className="flex w-full flex-col items-center justify-center">
        <p className="font-bold">Welcome back, {props.session?.user.name}!</p>
        <p>You have authenticated successfully.</p>
      </div>
      <p>Your available options:</p>
      <Link
        href="/dashboard"
        className="flex h-10 w-full items-center justify-center gap-2 bg-primary  text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Head to dashboard
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Link>
      <Button
        variant="outline"
        className="flex h-10 w-full items-center justify-center gap-2  text-sm font-semibold"
        onClick={props.signOutCallback}
      >
        Log out
        <LogOut className="h-4 w-4" strokeWidth={2.5} />
      </Button>
    </div>
  );
}

export default LoggedInStuff;
