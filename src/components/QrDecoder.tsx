"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  decodeQrFromBlob,
  decodeQrFromCanvasSource,
} from "@/lib/decodeQr";

type Source = "upload" | "camera" | "paste" | null;
type Status = "idle" | "scanning" | "success" | "error";

function isImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.type.startsWith("image/"));
}

export function QrDecoder() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameRef = useRef<number>(0);
  const previewUrlRef = useRef<string | null>(null);
  const dropDepthRef = useRef(0);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [source, setSource] = useState<Source>(null);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("Upload, paste, or scan a QR code.");
  const [copied, setCopied] = useState(false);

  const setPreview = useCallback((url: string | null) => {
    const current = previewUrlRef.current;
    if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(scanFrameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      const current = previewUrlRef.current;
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
    };
  }, [stopCamera]);

  const handleDecoded = useCallback(
    (text: string | null, nextSource: Source, failMessage: string) => {
      if (text) {
        setStatus("success");
        setSource(nextSource);
        setResult(text);
        setMessage("QR code decoded.");
        return true;
      }
      setStatus("error");
      setSource(nextSource);
      setResult("");
      setMessage(failMessage);
      return false;
    },
    [],
  );

  const decodeBlob = useCallback(
    async (blob: Blob, nextSource: Source) => {
      stopCamera();
      setStatus("scanning");
      setMessage("Reading QR code…");
      setCopied(false);

      if (blob instanceof File || blob.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(blob));
      }

      try {
        const text = await decodeQrFromBlob(blob);
        handleDecoded(
          text,
          nextSource,
          "No QR code found in that image. Try a clearer photo.",
        );
      } catch {
        handleDecoded(null, nextSource, "Could not read that image.");
      }
    },
    [handleDecoded, setPreview, stopCamera],
  );

  const onFiles = useCallback(
    (files: FileList | File[] | null) => {
      const file = files ? Array.from(files).find(isImageFile) : undefined;
      if (!file) {
        setStatus("error");
        setMessage("Please choose an image file (PNG, JPG, WebP, or GIF).");
        return;
      }
      void decodeBlob(file, "upload");
    },
    [decodeBlob],
  );

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setMessage("Camera is not supported in this browser.");
      return;
    }

    stopCamera();
    setPreview(null);
    setResult("");
    setCopied(false);
    setStatus("scanning");
    setSource("camera");
    setMessage("Starting camera…");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
      setMessage("Point the camera at a QR code.");

      const tick = () => {
        const current = videoRef.current;
        if (!current || current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          scanFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        const text = decodeQrFromCanvasSource(
          current,
          current.videoWidth,
          current.videoHeight,
        );
        if (text) {
          const frame = document.createElement("canvas");
          frame.width = current.videoWidth;
          frame.height = current.videoHeight;
          frame.getContext("2d")?.drawImage(current, 0, 0);
          setPreview(frame.toDataURL("image/png"));
          handleDecoded(text, "camera", "");
          stopCamera();
          return;
        }
        scanFrameRef.current = requestAnimationFrame(tick);
      };

      scanFrameRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraOn(false);
      setStatus("error");
      setMessage(
        "Could not open the camera. Allow camera access and try again on localhost or HTTPS.",
      );
    }
  }, [handleDecoded, setPreview, stopCamera]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        await decodeBlob(blob, "paste");
        return;
      }
      setStatus("error");
      setMessage("Clipboard has no image. Copy a QR screenshot, then paste.");
    } catch {
      setStatus("error");
      setMessage(
        "Clipboard image access was blocked. Use Ctrl+V / ⌘V on this page instead.",
      );
    }
  }, [decodeBlob]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;
        event.preventDefault();
        const file = item.getAsFile();
        if (file) void decodeBlob(file, "paste");
        return;
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [decodeBlob]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [result]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section
        onDragEnter={(event) => {
          event.preventDefault();
          dropDepthRef.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          dropDepthRef.current = Math.max(0, dropDepthRef.current - 1);
          if (dropDepthRef.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dropDepthRef.current = 0;
          setDragging(false);
          onFiles(event.dataTransfer.files);
        }}
        className={`rounded-3xl border p-4 transition sm:p-6 ${
          dragging
            ? "border-emerald-400 bg-emerald-400/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            className={`aspect-video w-full object-cover ${cameraOn ? "block" : "hidden"}`}
            playsInline
            muted
          />
          {!cameraOn && (
            <div className="flex aspect-video w-full items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="QR preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="px-6 text-center">
                  <p className="text-sm font-medium text-zinc-200">
                    Drop a QR image here
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    or paste with Ctrl+V / ⌘V
                  </p>
                </div>
              )}
            </div>
          )}
          {cameraOn && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Upload image
          </button>
          <button
            type="button"
            onClick={() => (cameraOn ? stopCamera() : void startCamera())}
            className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            {cameraOn ? "Stop camera" : "Open camera"}
          </button>
          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            className="rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
          >
            Paste image
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Result
          </h2>
          {source && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">
              via {source}
            </span>
          )}
        </div>
        <p
          className={`mt-2 text-sm ${
            status === "error" ? "text-rose-300" : "text-zinc-400"
          }`}
        >
          {message}
        </p>
        <pre className="mt-4 min-h-24 overflow-x-auto whitespace-pre-wrap break-all rounded-2xl bg-black/50 p-4 font-mono text-sm text-emerald-200">
          {result || "—"}
        </pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!result}
            onClick={() => void copyResult()}
            className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? "Copied" : "Copy text"}
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setPreview(null);
              setResult("");
              setSource(null);
              setCopied(false);
              setStatus("idle");
              setMessage("Upload, paste, or scan a QR code.");
            }}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      </section>
    </div>
  );
}
