"use client";

import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    token,
    setUser,
    setToken,
    setAuthenticated,
    setLoading,
  } = useAppStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // If no token, redirect to login
      if (!token) {
        router.push("/login");
        setIsChecking(false);
        return;
      }

      // If we have a token but no user, verify it
      if (!user) {
        try {
          const { apiClient } = await import("@/lib/api-client");
          apiClient.setToken(token);
          const userData = await apiClient.verifyToken();

          setUser({
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            persona: userData.persona,
            role: userData.role,
          });
          setAuthenticated(true);
        } catch (error) {
          console.error("Token verification failed:", error);
          // Clear invalid token
          setToken(null);
          setAuthenticated(false);
          router.push("/login");
        }
      }

      setIsChecking(false);
    }

    checkAuth();
  }, [token, user, router, setUser, setToken, setAuthenticated]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
