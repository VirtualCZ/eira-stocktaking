"use client"
import { useEffect, useState } from "react";
import { isAuthenticated, setAuthToken } from "@/utils/token";
import { useRouter } from "next/navigation";

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
    if (token.trim()) {
      setIsSettingToken(true);
      setAuthToken(token.trim());
      alert('Token nastaven! Prosím obnovte stránku.');
    }
  };

  if (!showError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4">Přístup zamítnut</h1>
        <p className="text-gray-600 mb-6">
          Pro přístup k aplikaci je vyžadován platný token. 
          Prosím, použijte správný odkaz s tokenem.
        </p>
        
        {/* Token Input for Testing */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-700 mb-3">
            <strong>Testování:</strong> Zadejte token pro přístup
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Zadejte token..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleSetToken}
              disabled={isSettingToken || !token.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {isSettingToken ? 'Nastavuji...' : 'Nastavit'}
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Příklad správného přístupu:</strong>
          </p>
          <code className="text-xs block mt-2 p-2 bg-white rounded">
            &lt;form method="POST" action="https://localhost:3000/"&gt;<br/>
            &nbsp;&nbsp;&lt;input type="hidden" name="token" value="your-token" /&gt;<br/>
            &nbsp;&nbsp;&lt;button type="submit"&gt;Otevřít aplikaci&lt;/button&gt;<br/>
            &lt;/form&gt;
          </code>
        </div>
      </div>
    </div>
  );
} 