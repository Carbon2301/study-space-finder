import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
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

  if (diff <= 0) return "Đã hết hạn";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const noiseLevelConfig = {
  quiet: {
    label: "Yên tĩnh",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    barColor: "bg-emerald-400",
    bars: 1,
  },
  medium: {
    label: "Vừa phải",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    barColor: "bg-amber-400",
    bars: 2,
  },
  noisy: {
    label: "Náo nhiệt",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    dotColor: "bg-rose-500",
    barColor: "bg-rose-400",
    bars: 3,
  },
};

export const purposeConfig = {
  solo: { label: "Học cá nhân", icon: "👤" },
  group: { label: "Học nhóm", icon: "👥" },
  meeting: { label: "Họp hành", icon: "🤝" },
  recording: { label: "Thu âm", icon: "🎙️" },
};

export const amenityIcons: Record<string, string> = {
  WiFi: "📶",
  "Ổ cắm điện": "🔌",
  "Điều hòa": "❄️",
  "Cà phê": "☕",
  "Đồ ăn": "🍽️",
  "In ấn": "🖨️",
  "Tủ đồ": "🔒",
  "Nước uống": "💧",
  "Bảng trắng": "📋",
  "Máy chiếu": "📽️",
  "Phòng cách âm": "🎧",
  "Ngoài trời": "🌿",
  "View thành phố": "🌆",
  "CSDL cao cấp": "📚",
  "Họp trực tuyến": "📹",
  "Máy in 3D": "⚙️",
  "Thiết bị học tập": "🔧",
};

// Cải tiến xử lý múi giờ và khung giờ
import { TimeSlot } from "@/types";

export function getLocalTimeInVN(): Date {
  const now = new Date();
  // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 7);
}

export function getTodayString(): string {
  const vnDate = getLocalTimeInVN();
  const year = vnDate.getFullYear();
  const month = String(vnDate.getMonth() + 1).padStart(2, "0");
  const day = String(vnDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeSlot(timeSlots: TimeSlot[]): TimeSlot | null {
  const vnDate = getLocalTimeInVN();
  const hours = vnDate.getHours();
  const minutes = vnDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  for (const slot of timeSlots) {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return slot;
    }
  }

  return null;
}

