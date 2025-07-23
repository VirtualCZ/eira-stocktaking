"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/utils/token";

export default function AuthGuard({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      
      if (!authenticated && pathname !== '/error') {
        router.push('/error');
      }
      
      setIsLoading(false);
    }
  }, [router, pathname]);

  // Don't show loading for error page
  if (pathname === '/error') {
    return children;
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f0f1f3"
      }}>
        <div style={{ fontSize: "1rem", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuth) {
    return null; // Will redirect to error
  }

  return children;
} 