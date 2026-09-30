import { createHmac, timingSafeEqual } from "node:crypto";

export const GATE_COOKIE = "qr_gate";
export const GATE_MAX_AGE_SECONDS = 60 * 60 * 12;

const GATE_MESSAGE = "qr-decoder-gate-v1";
const PIN_PATTERN = /^\d{6}$/;

export const GATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: GATE_MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};

function readAccessPin(): string {
  const pin = process.env.ACCESS_PIN ?? "";
  return PIN_PATTERN.test(pin) ? pin : "";
}

function secretsMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getGateToken(): string | null {
  const pin = readAccessPin();
  if (!pin) return null;
  return createHmac("sha256", pin).update(GATE_MESSAGE).digest("hex");
}

export function isValidPin(pin: string): boolean {
  const expected = readAccessPin();
  if (!expected || !PIN_PATTERN.test(pin)) return false;
  return secretsMatch(pin, expected);
}

export function isValidGateToken(token: string | undefined): boolean {
  const expected = getGateToken();
  if (!expected || !token) return false;
  return secretsMatch(token, expected);
}
