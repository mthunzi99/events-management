"use client";

import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import NavBar from "@/components/NavBar";
import AppSideBar from "@/components/AppSideBar";
import { EventProvider } from "@/components/context/EventProvider";
import { ScannerProvider } from "@/components/context/ScannerProvider";

export default function Providers({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  const { user, loading } = useAuth();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <EventProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <ScannerProvider>
            {user && <AppSideBar />}
            <div className="flex-1">
              <main className="w-full">
                {user && <NavBar />}
                <Toaster position="bottom-right" />
                <div className="px-4">{children}</div>
              </main>
            </div>
          </ScannerProvider>
        </SidebarProvider>
      </EventProvider>
    </ThemeProvider>
  );
}
