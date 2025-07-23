"use client"
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/utils/token";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const [showError, setShowError] = useState(false);
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