"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    sessionStorage.setItem("admin_pass", password);
    const r = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) router.push("/admin/dashboard");
    else { setError("Incorrect password"); setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-display text-2xl text-white">Glamour</span>
          <span className="font-display text-2xl text-[#C9A96E]"> Salon</span>
          <p className="text-white/60 text-sm mt-2 tracking-wider uppercase">Staff Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#16161d] border border-white/20 text-white placeholder-white/60 px-4 py-3.5 text-sm focus:outline-none focus:border-[#C9A96E]/50 transition"
          />
          {error && <p className="text-red-400 text-xs tracking-wide">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#C9A96E] text-[#0f0f13] py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-[#E8D5B0] disabled:opacity-40 transition"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-white/50 hover:text-white text-xs transition">← Back to site</a>
        </p>
      </div>
    </main>
  );
}
