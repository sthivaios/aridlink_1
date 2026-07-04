import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

function ErrorCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex h-full w-full flex-row items-center justify-center text-center font-mono">
      <Card className="flex w-min flex-col items-center px-20 py-10">
        <p className="mx-10 w-max text-xl">{title}</p>
        <TriangleAlert height={50} width={50} color="#FABB02" />
        {children}
        <Link
          href="mailto:me@sthivaios.dev"
          className="flex w-full items-center justify-center gap-2 bg-primary py-2 font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Report to the developers
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </Card>
    </div>
  );
}

export default ErrorCard;