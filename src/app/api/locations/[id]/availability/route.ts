import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanupExpiredReservations } from "@/lib/cleanup";
import { getFakeBookedSeats, getFakeBookedPeople, getTodayString, getLocalTimeInVN } from "@/lib/utils";
import { OpeningHours } from "@/types";

function getOpeningHoursForDay(openingHours: OpeningHours[], dayOfWeek: number) {
  // dayOfWeek: 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
  
  // 1. Tìm khớp chính xác cho Thứ Bảy / Chủ Nhật
  if (dayOfWeek === 6) {
    const sat = openingHours.find(oh => oh.day.toLowerCase().includes("thứ bảy"));
    if (sat) return sat;
  }
  if (dayOfWeek === 0) {
    const sun = openingHours.find(oh => oh.day.toLowerCase().includes("chủ nhật") && !oh.day.toLowerCase().includes("thứ hai"));
    if (sun) return sun;
  }
  
  // 2. Tìm khớp cho Thứ Hai – Thứ Sáu (1 đến 5)
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    const weekday = openingHours.find(oh => oh.day.toLowerCase().includes("thứ hai – thứ sáu"));
    if (weekday) return weekday;
  }
  
  // 3. Tìm khớp cho Thứ Hai – Chủ Nhật (áp dụng cho mọi ngày)
  const fullWeek = openingHours.find(oh => oh.day.toLowerCase().includes("thứ hai – chủ nhật"));
  if (fullWeek) return fullWeek;
  
  return null;
}

function getSlotLabel(startHour: number): string {
  if (startHour >= 7 && startHour < 9) return "Sáng sớm";
  if (startHour >= 9 && startHour < 11) return "Buổi sáng";
  if (startHour >= 11 && startHour < 13) return "Cuối buổi sáng";
  if (startHour >= 13 && startHour < 15) return "Buổi chiều";
  if (startHour >= 15 && startHour < 17) return "Cuối buổi chiều";
  if (startHour >= 17 && startHour < 19) return "Buổi tối";
  if (startHour >= 19 && startHour < 21) return "Ban đêm";
  return "Đêm muộn";
}

function generateSlotsFromOpeningHours(oh: OpeningHours | null) {
  if (!oh || oh.open === "Đóng cửa" || !oh.open || !oh.close) {
    return [];
  }
  
  const slots = [];
  const [openH, openM] = oh.open.split(":").map(Number);
  const [closeH, closeM] = oh.close.split(":").map(Number);
  
  let currentH = openH;
  let currentM = openM;
  let slotIndex = 1;
  
  // Cho phép giờ đến cách giờ đóng cửa ít nhất 30 phút
  while (currentH * 60 + currentM + 30 <= closeH * 60 + closeM) {
    const startHourStr = String(currentH).padStart(2, "0");
    const startMinStr = String(currentM).padStart(2, "0");
    
    // Giờ kết thúc mặc định là giờ đến + 1 tiếng, giới hạn bởi giờ đóng cửa
    let endH = currentH + 1;
    let endM = currentM;
    if (endH * 60 + endM > closeH * 60 + closeM) {
      endH = closeH;
      endM = closeM;
    }
    
    const endHourStr = String(endH).padStart(2, "0");
    const endMinStr = String(endM).padStart(2, "0");
    
    const startTime = `${startHourStr}:${startMinStr}`;
    const endTime = `${endHourStr}:${endMinStr}`;
    
    slots.push({
      id: `ts-${slotIndex}`,
      label: getSlotLabel(currentH),
      startTime,
      endTime,
      available: true,
    });
    
    currentM += 30;
    if (currentM >= 60) {
      currentH += 1;
      currentM -= 60;
    }
    slotIndex++;
  }
  
  return slots;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // 1. Tự động dọn dẹp các đặt chỗ quá hạn
    await cleanupExpiredReservations();

    // 2. Lấy location để biết totalSeats và openingHours
    const location = await db.location.findUnique({
      where: { id },
      select: { 
        totalSeats: true,
        openingHours: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // 3. Xác định ngày trong tuần để lấy giờ mở cửa và sinh khung giờ
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy

    const oh = getOpeningHoursForDay(location.openingHours, dayOfWeek);
    const generatedSlots = generateSlotsFromOpeningHours(oh);

    // 4. Lấy tất cả active reservations tại địa điểm này vào ngày được chọn
    const activeReservations = await db.reservation.findMany({
      where: {
        locationId: id,
        date: date,
        status: "active",
      },
    });

    const todayStr = getTodayString();
    const vnDate = getLocalTimeInVN();
    const currentMinutes = vnDate.getHours() * 60 + vnDate.getMinutes();

    // 5. Tính toán chỗ trống cho từng giờ đến (thống kê gộp theo khung giờ chuẩn 1 tiếng)
    const dynamicTimeSlots = generatedSlots.map((slot) => {
      // Xác định khung giờ chuẩn (1 tiếng)
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const stdStartH = Math.floor(startH);
      const stdStartStr = `${String(stdStartH).padStart(2, "0")}:00`;
      const stdEndStr = `${String(stdStartH + 1).padStart(2, "0")}:00`;
      const stdSlotId = `std-${String(stdStartH).padStart(2, "0")}`;

      // Lọc các đơn đặt chỗ thuộc khung giờ chuẩn này (giờ đến nằm trong khoảng stdStartStr đến stdEndStr)
      const slotReservations = activeReservations.filter((res) => {
        const s = res.timeSlot as unknown as { startTime?: string; endTime?: string } | null;
        if (!s || !s.startTime) return false;
        return s.startTime >= stdStartStr && s.startTime < stdEndStr;
      });

      // Tính tổng số ghế đã bị chiếm thực tế + fake dựa trên khung chuẩn
      const fakeTakenSeats = getFakeBookedSeats(id, stdSlotId, date, location.totalSeats);
      const actualTakenSeats = slotReservations.reduce((sum, res) => sum + res.seats, 0);
      const remainingSeats = Math.max(0, location.totalSeats - fakeTakenSeats - actualTakenSeats);

      // Tính số người đã đặt trước (thực tế + fake)
      const fakePeople = getFakeBookedPeople(id, stdSlotId, date, fakeTakenSeats);
      const actualPeople = slotReservations.length;
      const totalBookedPeople = fakePeople + actualPeople;

      // Kiểm tra xem giờ đến đã qua chưa (chỉ xét ngày hôm nay)
      // Đơn đặt chỗ sẽ hết hạn sau 15 phút tính từ giờ đến
      const startMinutes = startH * 60 + startM;
      const holdExpiryMinutes = startMinutes + 15;
      const isPast = (date === todayStr) && (currentMinutes >= holdExpiryMinutes);

      const isAvailable = remainingSeats > 0 && !isPast;

      return {
        ...slot,
        // Cập nhật lại số ghế trống thực tế cho slot này
        availableSeats: remainingSeats,
        // Một slot khả dụng nếu còn ít nhất 1 ghế trống và chưa trôi qua
        available: isAvailable,
        // Trả về số người đã đặt trước
        bookedPeople: totalBookedPeople,
        // Đánh dấu nếu khung giờ đã trôi qua
        isPast,
      };
    });

    return NextResponse.json({
      locationId: id,
      date,
      timeSlots: dynamicTimeSlots,
    });
  } catch (error) {
    console.error("Failed to fetch slot availability:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
