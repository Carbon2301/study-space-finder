"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, CheckCircle2, Timer } from "lucide-react";
import { toast } from "sonner";
import { Location, TimeSlot, Purpose } from "@/types";
import { cn, purposeConfig, formatDateTime } from "@/lib/utils";
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
  const [customPurpose, setCustomPurpose] = useState("");
  const [seats, setSeats] = useState(1);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [note, setNote] = useState("");
  const [timeSearch, setTimeSearch] = useState("");

  // Quản lý khung giờ động
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const filteredSlots = timeSlots.filter((slot) => {
    if (!timeSearch) return true;
    const cleanSearch = timeSearch.trim().toLowerCase().replace("h", ":");
    return (
      slot.startTime.includes(cleanSearch) ||
      slot.startTime.replace(/^0/, "").includes(cleanSearch)
    );
  });

  // Fetch slot trống động theo ngày
  const fetchSlotsAvailability = useCallback(async (date: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/locations/${location.id}/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setTimeSlots(data.timeSlots);
      }
    } catch (err) {
      console.error("Failed to load slot availability:", err);
    } finally {
      setLoadingSlots(false);
    }
  }, [location.id]);

  // Cập nhật lại hoặc reset selectedSlot khi timeSlots thay đổi
  useEffect(() => {
    if (selectedSlot && timeSlots.length > 0) {
      const updatedSlot = timeSlots.find((s) => s.startTime === selectedSlot.startTime && s.endTime === selectedSlot.endTime);
      if (!updatedSlot || !updatedSlot.available) {
        setTimeout(() => setSelectedSlot(null), 0);
      } else if (updatedSlot.availableSeats !== selectedSlot.availableSeats || updatedSlot.available !== selectedSlot.available) {
        setTimeout(() => setSelectedSlot(updatedSlot), 0);
      }
    }
  }, [timeSlots, selectedSlot]);

  // Reset khi mở modal và fetch dữ liệu ngày hôm nay
  useEffect(() => {
    if (open) {
      const todayStr = new Date().toISOString().split("T")[0];
      setTimeout(() => {
        setStep("form");
        setSelectedSlot(null);
        setSelectedPurpose("solo");
        setCustomPurpose("");
        setSeats(1);
        setNote("");
        setSelectedDate(todayStr);
        setTimeSearch("");
        fetchSlotsAvailability(todayStr);
      }, 0);
    }
  }, [open, fetchSlotsAvailability]);

  // Fetch lại khi đổi ngày
  useEffect(() => {
    if (open && selectedDate) {
      setTimeout(() => {
        setTimeSearch("");
        fetchSlotsAvailability(selectedDate);
      }, 0);
    }
  }, [open, selectedDate, fetchSlotsAvailability]);

  // Tự động giới hạn/điều chỉnh số ghế khi đổi slot
  useEffect(() => {
    if (selectedSlot) {
      const max = selectedSlot.availableSeats ?? 1;
      if (seats > max) {
        setTimeout(() => setSeats(Math.max(1, max)), 0);
      }
    } else {
      if (seats !== 1) {
        setTimeout(() => setSeats(1), 0);
      }
    }
  }, [selectedSlot, seats]);

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast.error("Vui lòng chọn một khung giờ");
      return;
    }
    // Giữ chỗ trong 15 phút tính từ lúc bắt đầu của khung giờ
    const slotStart = new Date(`${selectedDate}T${selectedSlot.startTime}:00`);
    const expiryDate = new Date(slotStart.getTime() + 15 * 60 * 1000).toISOString();
    setExpiresAt(expiryDate);

    const finalPurpose = selectedPurpose === "other" ? (customPurpose.trim() || "Khác") : selectedPurpose;

    addReservation({
      locationId: location.id,
      locationName: location.name,
      locationImage: location.images[0],
      date: selectedDate,
      timeSlot: selectedSlot,
      purpose: finalPurpose as Purpose,
      seats,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate,
      note,
    });

    setStep("success");
    toast.success("Đã giữ chỗ thành công! Vui lòng check-in trước thời gian hết hạn.", {
      duration: 5000,
    });
  };

  // Ngày tối thiểu = hôm nay
  const today = new Date().toISOString().split("T")[0];

  const purposes: Purpose[] = ["solo", "group", "meeting", "recording", "other"];

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg md:max-w-5xl z-[70] bg-white rounded-2xl shadow-2xl overflow-hidden"
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
            <div className="p-5 max-h-[85vh] md:max-h-[75vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === "form" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col space-y-5"
                  >
                    {/* Phần trên: Nhập thông tin (3 cột trên desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-5 border-b border-slate-100">
                      {/* Cột 1: Ngày & Ghế */}
                      <div className="space-y-4">
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
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
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
                              disabled={!selectedSlot || seats >= (selectedSlot?.availableSeats ?? 0)}
                              onClick={() => {
                                const max = selectedSlot?.availableSeats ?? 1;
                                setSeats(Math.min(max, seats + 1));
                              }}
                              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                            <span className="text-xs text-slate-400">
                              {!selectedSlot
                                ? "(Chọn giờ trước)"
                                : `(tối đa ${selectedSlot?.availableSeats ?? 0})`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cột 2: Mục đích sử dụng */}
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
                                  "flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all",
                                  selectedPurpose === p
                                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 text-slate-600 hover:border-indigo-300",
                                  p === "other" && "col-span-2 justify-center"
                                )}
                              >
                                <span>{pc.icon}</span>
                                {pc.label}
                              </button>
                            );
                          })}
                        </div>
                        {selectedPurpose === "other" && (
                          <div className="mt-2.5">
                            <input
                              type="text"
                              id="custom-purpose"
                              placeholder="Nhập mục đích khác (VD: Quay phim, Sự kiện...)"
                              value={customPurpose}
                              onChange={(e) => setCustomPurpose(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            />
                          </div>
                        )}
                      </div>

                      {/* Cột 3: Ghi chú */}
                      <div>
                        <label htmlFor="reservation-note" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Ghi chú cho cửa hàng (tùy chọn)
                        </label>
                        <textarea
                          id="reservation-note"
                          rows={4}
                          placeholder="Ví dụ: Bàn gần cửa sổ, chuẩn bị trước ổ cắm..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full h-[105px] border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Phần dưới: Chọn giờ đến (Trải rộng hết chiều ngang) */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-50">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock className="w-4 h-4 text-violet-500" />
                          Chọn giờ bạn sẽ đến
                        </label>
                        
                        {/* Lọc nhanh mốc giờ */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Tìm nhanh mốc giờ:</span>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Nhập giờ (Ví dụ: 08, 13:30...)"
                              value={timeSearch}
                              onChange={(e) => setTimeSearch(e.target.value)}
                              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-48 transition-all"
                            />
                            {timeSearch && (
                              <button
                                onClick={() => setTimeSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 overflow-y-auto pr-1 max-h-[260px] md:max-h-[340px]">
                        {loadingSlots ? (
                          <div className="col-span-full text-center py-10 text-sm text-slate-400">
                            Đang tải giờ đến...
                          </div>
                        ) : filteredSlots.length === 0 ? (
                          <div className="col-span-full text-center py-10 text-sm text-slate-400">
                            Không có mốc giờ nào phù hợp với &quot;{timeSearch}&quot;
                          </div>
                        ) : (
                          filteredSlots.map((slot) => (
                            <button
                              key={slot.id}
                              id={`slot-${slot.id}`}
                              disabled={!slot.available}
                              onClick={() =>
                                slot.available && setSelectedSlot(slot)
                              }
                              className={cn(
                                "relative p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-[68px]",
                                !slot.available
                                  ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200"
                                  : selectedSlot?.id === slot.id
                                  ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-100"
                                  : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                              )}
                            >
                              <div>
                                <p className="font-bold text-base text-slate-800">
                                  {slot.startTime}
                                </p>
                              </div>
                              {slot.bookedPeople !== undefined && (
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-none">
                                  {slot.bookedPeople} người đặt
                                </p>
                              )}
                              {!slot.available && (
                                <span className="absolute top-2 right-2 text-[9px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded leading-none">
                                  {slot.isPast ? "Đã qua" : "Đầy"}
                                </span>
                              )}
                              {selectedSlot?.id === slot.id && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                                </div>
                              )}
                            </button>
                          ))
                        )}
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
                      {selectedDate} · Giờ đến dự kiến: {selectedSlot?.startTime}
                    </p>

                    {/* Hết hạn giữ chỗ */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
                      <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Thời gian giữ chỗ
                        </span>
                      </div>
                      <div className="text-lg font-bold text-amber-600">
                        {formatDateTime(expiresAt)}
                      </div>
                      <p className="text-xs text-amber-600/70 mt-2">
                        Vui lòng check-in trước {formatDateTime(expiresAt)}, nếu không chỗ đặt của bạn sẽ tự động bị hủy
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

