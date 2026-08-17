import React from "react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/footer";

function CardPage({
  className,
  children,
  noBackground,
}: {
  className: string;
  children: React.ReactNode;
  noBackground?: boolean;
}) {
  return (
    <div className="flex h-screen w-full flex-row items-center justify-center text-center">
      <div
        className={`${noBackground ? "" : "topographic-paper"} fixed inset-0 -z-10`}
      />
      <Card className={`flex flex-col items-center px-20 py-10 ${className}`}>
        {children}
      </Card>
      <div className="fixed bottom-10 left-10 z-50">
        <Footer alignment="left" />
      </div>
    </div>
  );
}

export default CardPage;
