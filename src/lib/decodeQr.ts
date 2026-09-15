import jsQR from "jsqr";

const MAX_EDGE = 1600;

export function decodeQrFromImageData(imageData: ImageData): string | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data ?? null;
}

export function decodeQrFromCanvasSource(
  source: CanvasImageSource,
  width: number,
  height: number,
): string | null {
  if (width <= 0 || height <= 0) return null;

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  return decodeQrFromImageData(
    context.getImageData(0, 0, targetWidth, targetHeight),
  );
}

export async function decodeQrFromBlob(blob: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(blob);
  try {
    return decodeQrFromCanvasSource(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
