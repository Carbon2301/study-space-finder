"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Timer,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Reservation } from "@/types";
import { formatDate, formatCountdown, purposeConfig, cn } from "@/lib/utils";
import { useReservations } from "@/lib/store";
import { toast } from "sonner";

interface ReservationItemProps {
  reservation: Reservation;
  index: number;
}

export default function ReservationItem({
  reservation,
  index,
}: ReservationItemProps) {
  const { cancelReservation, expireReservation } = useReservations();
  const [countdown, setCountdown] = useState("");
  const purpose = purposeConfig[reservation.purpose];

  useEffect(() => {
    if (reservation.status !== "active") return;

    const tick = () => {
      const remaining = formatCountdown(reservation.expiresAt);
      setCountdown(remaining);
      if (remaining === "Expired") {
        expireReservation(reservation.id);
        toast.warning(`Đơn đặt chỗ tại ${reservation.locationName} đã hết hạn.`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [reservation, expireReservation]);

  const handleCancel = () => {
    cancelReservation(reservation.id);
    toast.success("Hủy đặt chỗ thành công.");
  };

  const statusConfig = {
    active: {
      label: "Đang hoạt động",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      color: "text-green-700 bg-green-100 border-green-200",
    },
    expired: {
      label: "Đã hết hạn",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      color: "text-slate-500 bg-slate-100 border-slate-200",
    },
    cancelled: {
      label: "Đã hủy",
      icon: <XCircle className="w-3.5 h-3.5" />,
      color: "text-red-600 bg-red-50 border-red-200",
    },
  };

  const sc = statusConfig[reservation.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={cn(
        "bg-white rounded-2xl border overflow-hidden transition-all",
        reservation.status === "active"
          ? "border-violet-100 shadow-md shadow-violet-50"
          : "border-slate-100 opacity-75"
      )}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-28 md:w-36 shrink-0">
          <Image
            src={reservation.locationImage}
            alt={reservation.locationName}
            fill
            className={cn(
              "object-cover",
              reservation.status !== "active" && "grayscale"
            )}
            sizes="150px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                {reservation.locationName}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>
                  {reservation.seats} chỗ ·{" "}
                  {purpose.icon} {purpose.label}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0",
                sc.color
              )}
            >
              {sc.icon}
              {sc.label}
            </span>
          </div>

          {/* Date/time */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(reservation.date)}</span>
            </div>
            <span className="text-slate-300">·</span>
            <span>
              {reservation.timeSlot.startTime} – {reservation.timeSlot.endTime}
            </span>
          </div>

          {/* Countdown (active only) */}
          {reservation.status === "active" && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs text-amber-700 font-medium">
                  Thời gian giữ chỗ còn
                </p>
                <p className="font-mono text-sm font-bold text-amber-600">
                  {countdown || "15:00"}
                </p>
              </div>
            </div>
          )}

          {/* Cancel button */}
          {reservation.status === "active" && (
            <button
              id={`cancel-reservation-${reservation.id}`}
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Hủy đặt chỗ
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
