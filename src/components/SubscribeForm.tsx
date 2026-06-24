"use client";

import { useState } from "react";

export interface SubscribeLabels {
  emailPlaceholder: string;
  cta: string;
  sending: string;
  success: string;
  invalid: string;
  error: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeForm({
  cardId,
  labels,
}: {
  cardId: string;
  labels: SubscribeLabels;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState("error");
      setMsg(labels.invalid);
      return;
    }
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), card_id: cardId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error === "invalid_email" ? labels.invalid : labels.error);
      }
      setState("done");
      setMsg(labels.success);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : labels.error);
    }
  }

  if (state === "done") {
    return (
      <p
        role="status"
        className="rounded-sm border border-verified/40 bg-verified/10 px-4 py-3 text-center font-sans text-sm text-verified"
      >
        {msg}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder={labels.emailPlaceholder}
          aria-label={labels.emailPlaceholder}
          className="flex-1 rounded-sm border border-copper/30 bg-navy-deep px-4 py-3 font-sans text-sm text-cream outline-none placeholder:text-cream/30 focus:border-copper"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-sm bg-copper px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-navy-deep transition-colors hover:bg-copper-light disabled:opacity-50"
        >
          {state === "sending" ? labels.sending : labels.cta}
        </button>
      </div>
      {state === "error" && msg && (
        <p className="font-mono text-[11px] text-absent">{msg}</p>
      )}
    </form>
  );
}
