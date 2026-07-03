import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <div className="flex flex-col items-start justify-center gap-4 font-mono text-[13px] text-foreground w-max">
      <p>AridLink Irrigation Manager v0.9.2</p>
      <div className="flex flex-col items-start justify-center gap-0">
        <p className="text-left font-bold">Copyright © 2026 Stratos Thivaios</p>
        <p>
          ALIM is free software under the{" "}
          <Link
            className="text-blue-400 transition-all duration-200 hover:text-primary font-bold hover:underline"
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