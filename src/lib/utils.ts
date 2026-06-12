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

export function formatTime(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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

export function getFakeBookedSeats(
  locationId: string,
  slotId: string,
  dateStr: string,
  totalSeats: number
): number {
  // Sinh số giả lập dựa trên hash của locationId, slotId, dateStr
  const str = `${locationId}-${slotId}-${dateStr}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  const absHash = Math.abs(hash);
  
  // Mật độ đặt chỗ ngẫu nhiên ổn định trong khoảng 35% đến 80%
  const minRate = 0.35;
  const maxRate = 0.8;
  const rateRange = maxRate - minRate;
  
  const fakeRate = minRate + ((absHash % 100) / 100) * rateRange;
  
  // Luôn đảm bảo trống tối thiểu 3 chỗ để user có thể thực hiện đặt chỗ thử nghiệm
  const maxFakeSeats = Math.max(0, totalSeats - 3);
  const fakeSeats = Math.round(totalSeats * fakeRate);
  
  return Math.min(maxFakeSeats, fakeSeats);
}

export function getFakeBookedPeople(
  locationId: string,
  slotId: string,
  dateStr: string,
  baseBookedSeats: number
): number {
  const basePeople = Math.max(1, Math.round(baseBookedSeats / 1.8));
  
  // Lấy múi giờ VN hiện tại để tính block 15 phút
  const vnDate = getLocalTimeInVN();
  const minutesSinceMidnight = vnDate.getHours() * 60 + vnDate.getMinutes();
  const block15 = Math.floor(minutesSinceMidnight / 15);
  
  // Tạo seed thay đổi mỗi 15 phút
  const str = `${locationId}-${slotId}-${dateStr}-${block15}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  
  const absHash = Math.abs(hash);
  // Biến thiên nhẹ trong khoảng [-1, 0, 1] hoặc [-2, -1, 0, 1, 2] tùy thuộc vào basePeople
  const maxChange = basePeople > 8 ? 2 : 1;
  const range = maxChange * 2 + 1;
  const offset = (absHash % range) - maxChange;
  
  return Math.max(1, basePeople + offset);
}

