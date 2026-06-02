"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusProps {
  availableSeats: number;
  totalSeats: number;
}

export default function LiveStatus({
  availableSeats,
  totalSeats,
}: LiveStatusProps) {
  const pct = Math.round(((totalSeats - availableSeats) / totalSeats) * 100);

  const status =
    availableSeats === 0
      ? { label: "Hết chỗ", color: "text-red-600", bg: "bg-red-50", pulse: "bg-red-500" }
      : availableSeats <= 3
      ? { label: "Sắp hết chỗ", color: "text-amber-600", bg: "bg-amber-50", pulse: "bg-amber-500" }
      : { label: "Còn chỗ", color: "text-green-600", bg: "bg-green-50", pulse: "bg-green-500" };

  return (
    <div className={cn("rounded-2xl p-5 border", status.bg, "border-current/10")}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "relative flex w-3 h-3",
            )}
          >
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                status.pulse
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-3 w-3",
                status.pulse
              )}
            />
          </span>
          <span className={cn("font-semibold text-sm", status.color)}>
            Trực tiếp — {status.label}
          </span>
        </div>
        <span className="text-xs text-slate-400">Vừa cập nhật</span>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <span className={cn("text-4xl font-bold", status.color)}>
            {availableSeats}
          </span>
          <span className="text-slate-500 text-sm ml-1">
            / {totalSeats} chỗ trống khả dụng
          </span>
        </div>
        <Users className={cn("w-5 h-5 mb-1", status.color)} />
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              pct < 50
                ? "bg-green-400"
                : pct < 80
                ? "bg-amber-400"
                : "bg-red-400"
            )}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>Trống</span>
          <span>Đã sử dụng {pct}%</span>
          <span>Đầy</span>
        </div>
      </div>
    </div>
  );
}
