"use client"
import { useEffect, useState } from "react";
import { isAuthenticated, setAuthToken } from "@/utils/token";
import { useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import TextInput from "@/components/atoms/TextInput";
import CardContainer from "@/components/atoms/CardContainer";

export default function ErrorPage() {
  const [showError, setShowError] = useState(false);
  const [token, setToken] = useState("");
  const [isSettingToken, setIsSettingToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has token
    if (!isAuthenticated()) {
      setShowError(true);
    } else {
      // If they have token, redirect to home
      router.push('/');
    }
  }, [router]);

  const handleSetToken = () => {
    if (!token.trim()) return;

    setIsSettingToken(true);
    try {
      setAuthToken(token.trim());
      // Full reload so AuthGuard picks up the new cookie (client router.push left a blank page).
      window.location.assign("/");
    } catch (error) {
      console.error("Error setting token:", error);
      alert("Chyba při nastavování tokenu: " + error.message);
      setIsSettingToken(false);
    }
  };

  if (!showError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f1f3" }}>
        <div style={{ fontSize: "1rem", color: "#535353" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#282828" }}>Přístup zamítnut</h1>
        <p className="mb-6" style={{ color: "#535353" }}>
          Pro přístup k aplikaci je vyžadován platný token. 
          Prosím, použijte správný odkaz s tokenem.
        </p>
        
        {/* Token Input for Testing */}
        <CardContainer className="mb-4">
          <p className="text-sm mb-3" style={{ color: "#535353" }}>
            Zadejte token pro přístup
          </p>
          <div className="flex gap-2">
            <TextInput
              label="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Zadejte token..."
            />
            <Button
              onClick={handleSetToken}
              disabled={isSettingToken || !token.trim()}
              style={{ 
                flex: "none",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                alignSelf: "flex-end",
                border: "none"
              }}
            >
              {isSettingToken ? 'Nastavuji...' : 'Nastavit'}
            </Button>
          </div>
        </CardContainer>

        <CardContainer>
          <p className="text-sm" style={{ color: "#535353" }}>
            <strong>Příklad správného přístupu:</strong>
          </p>
          <code className="text-xs block mt-2 p-2 rounded" style={{ background: "#f0f1f3", color: "#282828" }}>
            &lt;form method="POST" action="/"&gt;<br/>
            &nbsp;&nbsp;&lt;input type="hidden" name="token" value="your-token" /&gt;<br/>
            &nbsp;&nbsp;&lt;button type="submit"&gt;Otevřít aplikaci&lt;/button&gt;<br/>
            &lt;/form&gt;
          </code>
          
          {/* Debug section */}
          <div className="mt-4 p-3 rounded" style={{ background: "#f0f1f3" }}>
            <p className="text-xs mb-2" style={{ color: "#535353" }}>
              <strong>Debug Info:</strong>
            </p>
            <Button
              onClick={() => {
                const cookies = document.cookie;
                console.log('All cookies:', cookies);
                alert(`Cookies: ${cookies || 'none'}`);
              }}
              style={{ 
                fontSize: "0.75rem",
                padding: "0.5rem",
                borderRadius: "0.25rem",
                border: "none"
              }}
            >
              Check Cookies
            </Button>
          </div>
        </CardContainer>
      </div>
    </div>
  );
} 