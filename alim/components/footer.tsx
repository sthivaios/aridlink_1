import React from "react";
import Link from "next/link";

function Footer(props: { alignment: "left" | "right" }) {
  return (
    <div className="flex w-max flex-col items-start justify-center gap-4 font-mono text-[13px] text-foreground">
      <div className={`flex flex-col justify-center gap-0 ${props.alignment == "left" ? "items-start" : "items-end"}`}>
        <p className="mb-2">AridLink Irrigation Manager v0.9.2</p>
        <p className="text-left font-bold">Copyright © 2026 Stratos Thivaios</p>
        <p>
          ALIM is free software under the{" "}
          <Link
            className="font-bold text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            target="_blank"
          >
            GNU Affero General Public License v3
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Footer;