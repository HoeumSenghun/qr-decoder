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
      className="mt-8"
      onSubmit={(event) => {
        event.preventDefault();
        submit(pin);
      }}
    >
      <label htmlFor="passcode" className="sr-only">
        6-digit passcode
      </label>
      <div className="relative">
        <input
          id="passcode"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={PIN_LENGTH}
          pattern="\d{6}"
          disabled={pending}
          value={pin}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
            setPin(next);
            if (next.length === PIN_LENGTH) submit(next);
          }}
          className="absolute inset-0 z-10 cursor-text bg-transparent text-transparent caret-transparent"
        />
        <div className="flex justify-between gap-2 sm:gap-3">
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <div
              key={index}
              className={`flex h-14 w-full items-center justify-center rounded-2xl border bg-zinc-950 text-2xl text-zinc-50 sm:h-16 ${
                pin.length === index && !pending
                  ? "border-emerald-400/80 ring-2 ring-emerald-400/30"
                  : "border-white/10"
              }`}
            >
              {pin[index] ? "•" : ""}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 min-h-6 text-sm text-rose-300" role="alert">
        {error}
      </p>
      <button
        type="submit"
        disabled={pending || pin.length !== PIN_LENGTH}
        className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
