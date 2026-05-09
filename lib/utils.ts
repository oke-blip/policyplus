import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Safe `.map` input when JSON/i18n returns a non-array (prevents runtime crashes). */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

/** Filters list must be strings only; falls back to EN defaults if malformed. */
export function asStringArray(value: unknown, fallback: readonly string[]): string[] {
  if (Array.isArray(value) && value.every((x) => typeof x === "string")) {
    return value as string[]
  }
  return [...fallback]
}
