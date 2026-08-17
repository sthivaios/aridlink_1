import Image from "next/image";

import React from "react";

function Logo(props: { textColors?: { title: string; caption: string } }) {
  return (
    <div className="flex flex-row items-center justify-start gap-3">
      <Image
        src="/aridlink_logo.png"
        alt="The AridLink Logo"
        width={50}
        height={50}
      ></Image>
      <div className="flex flex-col justify-start text-left">
        <p className={`text-xl font-black ${props.textColors?.title}`}>ALIM</p>
        <p
          className={`text-sm ${props.textColors?.caption ?? "text-muted-foreground"} font-bold`}
        >
          AridLink Irrigation Manager
        </p>
      </div>
    </div>
  );
}

export default Logo;
