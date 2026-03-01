import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("pt-BR").format(points);
}

export function getTierInfo(points: number) {
  if (points >= 10000) return { tier: "DIAMANTE" as const, label: "Diamante", color: "from-cyan-400 to-blue-500", next: null, progress: 100 };
  if (points >= 5000) return { tier: "OURO" as const, label: "Ouro", color: "from-yellow-400 to-amber-500", next: 10000, progress: ((points - 5000) / 5000) * 100 };
  if (points >= 1000) return { tier: "PRATA" as const, label: "Prata", color: "from-gray-300 to-gray-500", next: 5000, progress: ((points - 1000) / 4000) * 100 };
  return { tier: "BRONZE" as const, label: "Bronze", color: "from-orange-400 to-orange-600", next: 1000, progress: (points / 1000) * 100 };
}
