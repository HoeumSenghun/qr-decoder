import { CoffeeKhqr } from "@/components/CoffeeKhqr";
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
            happens in your browser nothing is uploaded to a server.
          </p>
        </header>
        <div className="flex flex-col gap-6">
          <QrDecoder />
          <CoffeeKhqr />
        </div>
      </main>
      <footer className="border-t border-zinc-800/80 px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 text-sm text-zinc-500">
          <span>Built by senghunh@emoney</span>
          <a
            href="https://github.com/HoeumSenghun"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile of HoeumSenghun"
            className="inline-flex text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5 fill-current"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.91-.01 3.31 0 .32.22.69.83.57C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
