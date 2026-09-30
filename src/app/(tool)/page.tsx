import { lock } from "@/app/login/actions";
import { CoffeeKhqr } from "@/components/CoffeeKhqr";
import { QrDecoder } from "@/components/QrDecoder";
import { QrGenerator } from "@/components/QrGenerator";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,#163227_0%,#09090b_42%)]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              QR Decoder
            </p>
            <form action={lock}>
              <button
                type="submit"
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-zinc-100"
              >
                Lock
              </button>
            </form>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            QR image to text, and back
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-zinc-400">
            Decode a photo, camera scan, or paste or type a string and get a
            QR image. Everything runs in your browser.
          </p>
        </header>
        <div className="flex flex-col gap-6">
          <QrDecoder />
          <QrGenerator />
          <CoffeeKhqr />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
