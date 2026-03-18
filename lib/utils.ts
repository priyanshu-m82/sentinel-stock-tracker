import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value?: number): string {
  if (typeof value !== "number") return "N/A";

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function getPriceChangeColor(change: number): string {
  if (change > 0) return "text-green-500";
  if (change < 0) return "text-red-500";
  return "text-gray-400";
}

export function getPriceBgColor(change: number): string {
  if (change > 0) return "bg-green-500/10 text-green-500";
  if (change < 0) return "bg-red-500/10 text-red-500";
  return "bg-gray-500/10 text-gray-400";
}

export function getDateRange(days: number): { from: number; to: number; fromStr: string; toStr: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return {
    from: Math.floor(from.getTime() / 1000),
    to: Math.floor(to.getTime() / 1000),
    fromStr: from.toISOString().split("T")[0],
    toStr: to.toISOString().split("T")[0],
  };
}