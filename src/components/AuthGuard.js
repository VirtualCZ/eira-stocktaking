"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthHeadersSafe, isAuthenticated } from "@/utils/token";

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f1f3",
      }}
    >
      <div style={{ fontSize: "1rem", color: "#666" }}>Loading...</div>
    </div>
  );
}

export default function AuthGuard({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuthAndBackend = async () => {
      setIsLoading(true);

      const authenticated = isAuthenticated();
      setIsAuth(authenticated);

      if (!authenticated) {
        if (pathname !== "/error") {
          router.push("/error");
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/current", {
          method: "GET",
          headers: getAuthHeadersSafe(),
          cache: "no-store",
        });

        if (response.status === 401) {
          setIsAuth(false);
          if (pathname !== "/error") {
            router.push("/error");
          }
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          if (pathname !== "/unavailable") {
            router.push("/unavailable");
          }
          setIsLoading(false);
          return;
        }

        if (pathname === "/unavailable") {
          router.push("/");
        }
      } catch (_err) {
        if (pathname !== "/unavailable") {
          router.push("/unavailable");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndBackend();
  }, [pathname, router]);

  if (pathname === "/error" || pathname === "/unavailable") {
    return children;
  }

  if (isLoading || !isAuth) {
    return <LoadingScreen />;
  }

  return children;
}
