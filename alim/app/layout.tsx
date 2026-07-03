import { Geist, Geist_Mono, Inter, Nunito_Sans } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

const nunitoSans = Nunito_Sans({subsets:['latin'],variable:'--font-sans'});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AridLink Irrigation Manager",
  icons: {
    icon: "/aridlink_logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        nunitoSans.variable
      )}
    >
      <link rel="icon" href="/app/favicon.ico" sizes="any" />
      <body>
        <ThemeProvider>
          <div className="fixed right-6 top-3 z-50">
            <ThemeToggle />
          </div>
          {children}
          <Toaster richColors={true} position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
