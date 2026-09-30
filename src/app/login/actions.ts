"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  GATE_COOKIE,
  gateCookieOptions,
  getGateToken,
  isValidPin,
} from "@/lib/gate";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const FAIL_DELAY_MS = 400;

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(headerList: Headers): string {
  return (
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "local"
  );
}

function isLocked(key: string): boolean {
  const current = attempts.get(key);
  if (!current) return false;
  if (Date.now() > current.resetAt) {
    attempts.delete(key);
    return false;
  }
  return current.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now > current.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  current.count += 1;
}

function clearFailures(key: string): void {
  attempts.delete(key);
}

export async function unlock(
  pin: string,
): Promise<{ ok: false; error: string }> {
  const headerList = await headers();
  const key = clientKey(headerList);

  if (isLocked(key)) {
    return {
      ok: false,
      error: "Too many attempts. Try again in a few minutes.",
    };
  }

  if (!(await isValidPin(pin))) {
    recordFailure(key);
    await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
    return { ok: false, error: "Wrong passcode." };
  }

  const token = await getGateToken();
  if (!token) {
    return { ok: false, error: "Passcode is not configured." };
  }

  clearFailures(key);
  const jar = await cookies();
  jar.set(GATE_COOKIE, token, gateCookieOptions());
  redirect("/");
}

export async function lock(): Promise<void> {
  const jar = await cookies();
  jar.set(GATE_COOKIE, "", { ...gateCookieOptions(), maxAge: 0 });
  redirect("/login");
}
