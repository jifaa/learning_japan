import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal className handling.
 * Use this for all component className props.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ponytail: removed formatNumber/formatBytes/sleep — never imported, inline when needed

// ponytail: removed isServer/isClient — inline `typeof window === "undefined"` is self-documenting.
