"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Store in sessionStorage so dashboard can read it
    sessionStorage.setItem("admin_pass", password);
    // Verify via API
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then((r) => {
      if (r.ok) router.push("/admin/dashboard");
      else setError("Wrong password");
    });
  }

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-10 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">💆</div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Salon Owner Login</h1>
        <p className="text-sm text-gray-400 mb-6">Access your appointment dashboard</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-3 rounded-full font-semibold hover:bg-rose-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
