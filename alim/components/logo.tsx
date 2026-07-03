import Image from "next/image";

import React from "react";

function Logo() {
  return (
    <div className="flex flex-row items-center gap-2.5">
      <Image
        src="/aridlink_logo.png"
        alt="The AridLink Logo"
        width={50}
        height={50}
      ></Image>
      <div className="leading-tight">
        <div className="font-mono text-xl font-bold tracking-tight">ALIM</div>
        <div className="font-mono text-[13px] tracking-[0.14em] text-muted-foreground uppercase">
          AridLink Irrigation Manager
        </div>
      </div>
    </div>
  );
}

export default Logo;