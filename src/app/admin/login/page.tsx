"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    setBusy(false);
    if (res.ok) {
      const from =
        new URLSearchParams(window.location.search).get("from") || "/admin";
      router.push(from);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error de autenticación");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-copper">
          FulcrumCards · Admin
        </div>
        <h1 className="mb-8 font-display text-3xl font-extrabold text-cream">
          Acceso
        </h1>
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-cream/50">
          Usuario
        </label>
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoComplete="username"
          className="mb-4 w-full rounded-sm border border-copper/25 bg-navy-deep px-3 py-2 font-sans text-sm text-cream outline-none focus:border-copper"
        />
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-cream/50">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mb-6 w-full rounded-sm border border-copper/25 bg-navy-deep px-3 py-2 font-sans text-sm text-cream outline-none focus:border-copper"
        />
        {error && (
          <p className="mb-4 font-mono text-[11px] text-absent">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-sm bg-copper px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-navy-deep transition-colors hover:bg-copper-light disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
