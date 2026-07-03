import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";

function Page() {
  return (
    <div className="flex h-screen w-full flex-row items-center justify-center text-center font-mono">
      <div className="topographic-paper fixed inset-0 -z-10" />
      <Card className="flex w-min flex-col items-center px-20 py-10">
        <p className="mx-10 w-max text-2xl font-bold">404 - Not found</p>
        <Image
          src="/forgor.webp"
          alt="I forgor image"
          height={150}
          width={150}
        />
        <p className="text-[16px] font-bold">
          The requested resource is not registered in ALIM and could not be
          located.
        </p>
        <p className="text-[16px] font-bold">Verify the URL and try again.</p>
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 bg-primary py-2 font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Head to dashboard
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </Card>
      <div className="fixed bottom-10 left-10 z-50">
        <Footer />
      </div>
    </div>
  );
}

export default Page;
