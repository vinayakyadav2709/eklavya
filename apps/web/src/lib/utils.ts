import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PROVIDER_LOGOS: Record<string, { bg: string; text: string; fg: string }> = {
  kite: { bg: "from-blue-500/30 to-indigo-600/20", text: "K", fg: "text-blue-600" },
  kotak: { bg: "from-orange-400/30 to-red-500/20", text: "KT", fg: "text-orange-600" },
}
