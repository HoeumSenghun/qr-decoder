const GATE_MESSAGE = "qr-decoder-gate-v1";
const PIN_PATTERN = /^\d{6}$/;

export const GATE_COOKIE = "qr_gate";
export const GATE_MAX_AGE_SECONDS = 60 * 60 * 12;

function envPin(): string {
  // Bracket access so Next.js cannot replace this with an empty build-time value.
  const pin = process.env["ACCESS_PIN"]?.trim() ?? "";
  return PIN_PATTERN.test(pin) ? pin : "";
}

async function readAccessPin(): Promise<string> {
  const fromProcess = envPin();
  if (fromProcess) return fromProcess;

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const fromWorker = env.ACCESS_PIN?.trim() ?? "";
    if (PIN_PATTERN.test(fromWorker)) return fromWorker;
  } catch {
    // next dev / proxy without a Worker context
  }

  return "";
}

function secretsMatch(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const encoded = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoded.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoded.encode(message),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function gateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: GATE_MAX_AGE_SECONDS,
    secure: process.env["NODE_ENV"] !== "development",
  };
}

export async function getGateToken(): Promise<string | null> {
  const pin = await readAccessPin();
  if (!pin) return null;
  return hmacHex(pin, GATE_MESSAGE);
}

export async function isValidPin(pin: string): Promise<boolean> {
  const expected = await readAccessPin();
  if (!expected || !PIN_PATTERN.test(pin)) return false;
  return secretsMatch(pin, expected);
}

export async function isValidGateToken(
  token: string | undefined,
): Promise<boolean> {
  const expected = await getGateToken();
  if (!expected || !token) return false;
  return secretsMatch(token, expected);
}
