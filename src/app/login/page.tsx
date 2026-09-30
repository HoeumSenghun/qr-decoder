import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { PinForm } from "./PinForm";

export const metadata: Metadata = {
  title: "Unlock · QR Decoder",
  description: "Enter the 6-digit passcode to use QR Decoder.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,#163227_0%,#09090b_42%)]">
      <main className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col justify-center overflow-y-auto px-4 py-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          QR Decoder
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
          Enter passcode
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">
          This tool is locked. Type the 6-digit PIN to continue.
        </p>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <PinForm />
        </section>
      </main>
      <div className="shrink-0">
        <SiteFooter />
      </div>
    </div>
  );
}
