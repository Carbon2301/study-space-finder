import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCountdown(expiresAt: string): string {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return "Expired";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const noiseLevelConfig = {
  quiet: {
    label: "Quiet",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    barColor: "bg-emerald-400",
    bars: 1,
  },
  medium: {
    label: "Medium",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    barColor: "bg-amber-400",
    bars: 2,
  },
  noisy: {
    label: "Lively",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    dotColor: "bg-rose-500",
    barColor: "bg-rose-400",
    bars: 3,
  },
};

export const purposeConfig = {
  solo: { label: "Solo Study", icon: "👤" },
  group: { label: "Group Study", icon: "👥" },
  meeting: { label: "Meeting", icon: "🤝" },
  recording: { label: "Recording", icon: "🎙️" },
};

export const amenityIcons: Record<string, string> = {
  WiFi: "📶",
  "Power Outlet": "🔌",
  AC: "❄️",
  Coffee: "☕",
  Food: "🍽️",
  Printing: "🖨️",
  Lockers: "🔒",
  Water: "💧",
  Whiteboard: "📋",
  Projector: "📽️",
  "Soundproof Booths": "🎧",
  "Open Air": "🌿",
  "City View": "🌆",
  "Premium DB Access": "📚",
  "Video Conferencing": "📹",
  "3D Printer": "⚙️",
  Equipment: "🔧",
};
