import { AppShell } from "@/components/app-shell";
import Footer from "@/components/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      {children}
      <div className="fixed right-10 bottom-10 z-50">
        <Footer alignment="right" />
      </div>
    </AppShell>
  );
}
