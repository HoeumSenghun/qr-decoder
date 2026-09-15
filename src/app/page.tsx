import { QrDecoder } from "@/components/QrDecoder";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,_#163227_0%,_#09090b_42%)]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            QR Decoder
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Turn a QR image into text
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-zinc-400">
            Upload a photo, open your camera, or paste a screenshot. Decoding
            happens in your browser — nothing is uploaded to a server.
          </p>
        </header>
        <QrDecoder />
      </main>
    </div>
  );
}
