"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, CheckCircle2, Timer } from "lucide-react";
import { toast } from "sonner";
import { Location, TimeSlot, Purpose } from "@/types";
import { cn, formatCountdown, purposeConfig } from "@/lib/utils";
import { useReservations } from "@/lib/store";

interface ReservationModalProps {
  location: Location;
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "success";

export default function ReservationModal({
  location,
  open,
  onClose,
}: ReservationModalProps) {
  const { addReservation } = useReservations();

  const [step, setStep] = useState<Step>("form");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose>("solo");
  const [seats, setSeats] = useState(1);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [countdown, setCountdown] = useState("");

  // Quản lý khung giờ động
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Fetch slot trống động theo ngày
  const fetchSlotsAvailability = async (date: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/locations/${location.id}/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setTimeSlots(data.timeSlots);
        
        // Nếu đang chọn một slot, cập nhật lại hoặc reset nếu slot đó không còn khả dụng
        if (selectedSlot) {
          const updatedSlot = data.timeSlots.find((s: any) => s.id === selectedSlot.id);
          if (!updatedSlot || !updatedSlot.available) {
            setSelectedSlot(null);
          } else {
            setSelectedSlot(updatedSlot);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load slot availability:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Reset khi mở modal và fetch dữ liệu ngày hôm nay
  useEffect(() => {
    if (open) {
      setStep("form");
      setSelectedSlot(null);
      setSelectedPurpose("solo");
      setSeats(1);
      const todayStr = new Date().toISOString().split("T")[0];
      setSelectedDate(todayStr);
      fetchSlotsAvailability(todayStr);
    }
  }, [open]);

  // Fetch lại khi đổi ngày
  useEffect(() => {
    if (open && selectedDate) {
      fetchSlotsAvailability(selectedDate);
    }
  }, [selectedDate]);

  // Tự động giới hạn/điều chỉnh số ghế khi đổi slot
  useEffect(() => {
    if (selectedSlot) {
      const max = (selectedSlot as any).availableSeats ?? 1;
      if (seats > max) {
        setSeats(Math.max(1, max));
      }
    } else {
      setSeats(1);
    }
  }, [selectedSlot]);

  // Countdown timer cho màn hình thành công
  useEffect(() => {
    if (step !== "success" || !expiresAt) return;
    const interval = setInterval(() => {
      const remaining = formatCountdown(expiresAt);
      setCountdown(remaining);
      if (remaining === "Expired") {
        clearInterval(interval);
      }
    }, 1000);
    setCountdown(formatCountdown(expiresAt));
    return () => clearInterval(interval);
  }, [step, expiresAt]);

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast.error("Vui lòng chọn một khung giờ");
      return;
    }
    // Giữ chỗ trong 15 phút
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    setExpiresAt(expiryDate);

    addReservation({
      locationId: location.id,
      locationName: location.name,
      locationImage: location.images[0],
      date: selectedDate,
      timeSlot: selectedSlot,
      purpose: selectedPurpose,
      seats,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate,
    });

    setStep("success");
    toast.success("Đã giữ chỗ thành công! Bạn có 15 phút để check-in.", {
      duration: 5000,
    });
  };

  // Ngày tối thiểu = hôm nay
  const today = new Date().toISOString().split("T")[0];

  const purposes: Purpose[] = ["solo", "group", "meeting", "recording"];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg z-[70] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  {step === "success" ? "Đặt chỗ thành công! 🎉" : "Đặt chỗ học tập"}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{location.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[65vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === "form" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    {/* Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 text-violet-500" />
                        Chọn ngày
                      </label>
                      <input
                        id="reservation-date"
                        type="date"
                        min={today}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Clock className="w-4 h-4 text-violet-500" />
                        Chọn khung giờ
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {loadingSlots ? (
                          <div className="col-span-2 text-center py-6 text-sm text-slate-400">
                            Đang tải khung giờ...
                          </div>
                        ) : timeSlots.length === 0 ? (
                          <div className="col-span-2 text-center py-6 text-sm text-slate-400">
                            Không có khung giờ nào khả dụng
                          </div>
                        ) : (
                          timeSlots.map((slot) => (
                            <button
                              key={slot.id}
                              id={`slot-${slot.id}`}
                              disabled={!slot.available}
                              onClick={() =>
                                slot.available && setSelectedSlot(slot)
                              }
                              className={cn(
                                "relative p-3 rounded-xl border text-left transition-all",
                                !slot.available
                                  ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200"
                                  : selectedSlot?.id === slot.id
                                  ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-100"
                                  : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                              )}
                            >
                              <p className="font-semibold text-sm text-slate-800">
                                {slot.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {slot.startTime} – {slot.endTime}
                              </p>
                              {(slot as any).availableSeats !== undefined && (
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                  {slot.available ? `Còn ${(slot as any).availableSeats} chỗ` : "Hết chỗ"}
                                </p>
                              )}
                              {!slot.available && (
                                <span className="absolute top-2 right-2 text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">
                                  Đầy
                                </span>
                              )}
                              {selectedSlot?.id === slot.id && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle2 className="w-4 h-4 text-violet-600" />
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Mục đích sử dụng
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {purposes.map((p) => {
                          const pc = purposeConfig[p];
                          return (
                            <button
                              key={p}
                              id={`purpose-${p}`}
                              onClick={() => setSelectedPurpose(p)}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                                selectedPurpose === p
                                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 text-slate-600 hover:border-indigo-300"
                              )}
                            >
                              <span>{pc.icon}</span>
                              {pc.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seats */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Số lượng ghế
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={!selectedSlot}
                          onClick={() => setSeats(Math.max(1, seats - 1))}
                          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-slate-800">
                          {seats}
                        </span>
                        <button
                          disabled={!selectedSlot || seats >= ((selectedSlot as any).availableSeats ?? 0)}
                          onClick={() => {
                            const max = (selectedSlot as any).availableSeats ?? 1;
                            setSeats(Math.min(max, seats + 1));
                          }}
                          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-400">
                          {!selectedSlot
                            ? "(Vui lòng chọn khung giờ trước)"
                            : `(tối đa còn ${(selectedSlot as any).availableSeats ?? 0} chỗ trống)`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    {/* Success icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      Đặt chỗ thành công!
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Đã đặt {seats} chỗ ngồi tại <strong>{location.name}</strong>
                      <br />
                      {selectedDate} · {selectedSlot?.startTime} –{" "}
                      {selectedSlot?.endTime}
                    </p>

                    {/* Countdown */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
                      <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Thời gian giữ chỗ
                        </span>
                      </div>
                      <div className="text-5xl font-bold text-amber-600 font-mono">
                        {countdown || "15:00"}
                      </div>
                      <p className="text-xs text-amber-600/70 mt-2">
                        Vui lòng check-in trước khi hết giờ, nếu không chỗ đặt của bạn sẽ tự động bị hủy
                      </p>
                    </div>

                    <p className="text-xs text-slate-400">
                      Xem đơn đặt chỗ của bạn tại{" "}
                      <a
                        href="/reservations"
                        className="text-violet-600 underline"
                        onClick={onClose}
                      >
                        Đặt chỗ của tôi
                      </a>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step === "form" && (
              <div className="p-5 pt-0 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  id="confirm-reservation"
                  onClick={handleConfirm}
                  disabled={!selectedSlot}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all",
                    selectedSlot
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 shadow-md shadow-violet-200 active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  Xác nhận đặt chỗ
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="p-5 pt-0">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Hoàn tất
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

