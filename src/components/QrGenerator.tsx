"use client";

import { useId, useRef, useState } from "react";
import QRCode from "qrcode";

export function QrGenerator() {
  const inputId = useId();
  const timerRef = useRef<number>(0);
  const [text, setText] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function updateText(next: string) {
    setText(next);
    window.clearTimeout(timerRef.current);

    const value = next.trim();
    if (!value) {
      setDataUrl(null);
      setError("");
      return;
    }

    timerRef.current = window.setTimeout(() => {
      QRCode.toDataURL(value, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#09090b", light: "#ffffff" },
      })
        .then((url) => {
          setDataUrl(url);
          setError("");
        })
        .catch(() => {
          setDataUrl(null);
          setError("That text is too long or cannot be encoded as a QR code.");
        });
    }, 200);
  }

  async function copyImage() {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadImage() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qr-code.png";
    link.click();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Create
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">
            Turn text into a QR image
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Type a URL, payment string, or any message. The QR is generated in
            your browser.
          </p>
          <label htmlFor={inputId} className="sr-only">
            Text to encode
          </label>
          <textarea
            id={inputId}
            value={text}
            onChange={(event) => updateText(event.target.value)}
            rows={5}
            placeholder="https://example.com or any string"
            className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
          />
          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!dataUrl}
              onClick={downloadImage}
              className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download PNG
            </button>
            <button
              type="button"
              disabled={!dataUrl}
              onClick={() => void copyImage()}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy image"}
            </button>
          </div>
        </div>
        <figure className="mx-auto w-full max-w-60 shrink-0 sm:mx-0 sm:pt-10">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="Generated QR code"
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="px-4 text-center text-sm text-zinc-500">
                QR preview
              </p>
            )}
          </div>
        </figure>
      </div>
    </section>
  );
}
