"use client";

import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import Auth from "@/components/auth/Auth";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect AFTER render
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  // Still loading auth
  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Not logged in → show auth
  if (!user) {
    return <Auth />;
  }

  // While redirecting
  return null;
}
