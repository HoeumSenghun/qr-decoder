"use client";

import { useState, useTransition } from "react";
import { unlock } from "./actions";

const PIN_LENGTH = 6;

export function PinForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(nextPin: string) {
    if (pending || nextPin.length !== PIN_LENGTH) return;
    setError("");
    startTransition(async () => {
      const result = await unlock(nextPin);
      if (result && !result.ok) {
        setError(result.error);
        setPin("");
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(pin);
      }}
    >
      <label htmlFor="passcode" className="mb-2 block text-sm font-medium text-zinc-300">
        6-digit passcode
      </label>
      <input
        id="passcode"
        name="pin"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={PIN_LENGTH}
        pattern="\d{6}"
        disabled={pending}
        value={pin}
        placeholder="••••••"
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
          setPin(next);
          if (next.length === PIN_LENGTH) submit(next);
        }}
        className="h-16 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 text-center font-mono text-2xl tracking-[0.6em] text-zinc-50 outline-none transition placeholder:tracking-[0.6em] placeholder:text-zinc-600 focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-60"
      />
      <p className="mt-3 min-h-6 text-sm text-rose-300" role="alert">
        {error}
      </p>
      <button
        type="submit"
        disabled={pending || pin.length !== PIN_LENGTH}
        className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
