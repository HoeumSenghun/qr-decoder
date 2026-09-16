import Image from "next/image";

export function CoffeeKhqr() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Support
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">
            Buy me a cup of coffee
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
            If this decoder saved you a minute, scan my KHQR and send a coffee.
            It lands with Hoeum Senghun.
          </p>
          <a
            href="/mykhqr.jpg"
            download="hoeum-senghun-khqr.jpg"
            className="mt-4 inline-flex rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
          >
            Save QR image
          </a>
        </div>
        <figure className="mx-auto w-full max-w-[240px] shrink-0 sm:mx-0">
          <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <Image
              src="/mykhqr.jpg"
              alt="KHQR payment code for Hoeum Senghun"
              width={720}
              height={1080}
              className="h-auto w-full"
              priority={false}
            />
          </div>
          <figcaption className="mt-3 text-center text-xs text-zinc-500">
            KHQR · Hoeum Senghun
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
