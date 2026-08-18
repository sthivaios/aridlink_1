import React from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";

function Page() {
  return (
    <div className="topographic-paper flex min-h-screen flex-col items-center gap-5 py-20">
      <h1 className="mb-5 text-2xl font-extrabold">
        About AridLink Irrigation Manager
      </h1>
      <Card className="flex w-full max-w-xl flex-col items-center gap-4 p-10">
        <p className="font-extrabold">
          You&#39;re using AridLink Irrigation Manager version 0.9.2
        </p>
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <p className="font-bold">
            Contact information for the operator of this instance:
          </p>
          <p>{"name goes here"}</p>
          <div className="flex flex-row items-center gap-2">
            <Mail size={16} />
            <p>{"email goes here"}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Phone size={16} />
            <p>{"phone goes here"}</p>
          </div>
        </div>
      </Card>
      <Card className="flex max-w-xl flex-col items-center gap-4 p-10">
        <p>
          You can submit a bug reports and feature requests{" "}
          <Link
            target="_blank"
            href="https://github.com/sthivaios/aridlink_1/issues"
            className="text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            on GitHub
          </Link>
          .
        </p>
        <p className="text-center text-wrap">
          AridLink Irrigation Manager is free software, that is licensed under
          the GNU Affero General Public License v3.0. If you modify and run this
          software as a network service, you must make your modified source
          available to all users. You may access a copy of the AGPLv3 terms and
          conditions served locally in application,{" "}
          <Link
            target="_blank"
            href="/app/(main_app)/about/agplv3"
            className="text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            here
          </Link>
          .
        </p>
        <p className="text-center">
          The source code for AridLink Irrigation Manager, as well as all other
          parts of the AridLink project, are available{" "}
          <Link
            target="_blank"
            href="https://github.com/sthivaios/aridlink_1"
            className="text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            on GitHub
          </Link>
          .
        </p>
        <p className="text-center">
          Thank you for using AridLink! Consider supporting this project by
          contributing to it.
        </p>
        <p className="mt-6 text-center italic">
          Copyright © 2026 Stratos Thivaios. AridLink Irrigation Manager comes
          with ABSOLUTELY NO WARRANTY; see the license for details.
        </p>
      </Card>
      <Link
        href="/login"
        className="flex flex-row items-center justify-center gap-2 bg-primary px-5 py-1.5 text-sm leading-none font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Return to home
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

export default Page;
