"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/AppSideBar";
import NavBar from "@/components/NavBar";

const PrivatePagesLayout = ({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user]);

  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
};

export default PrivatePagesLayout;
