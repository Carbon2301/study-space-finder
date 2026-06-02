import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanupExpiredReservations } from "@/lib/cleanup";
import { getTodayString, getCurrentTimeSlot } from "@/lib/utils";
import { mockTimeSlots } from "@/lib/mock-data";

export async function GET() {
  try {
    // 1. Tự động dọn dẹp các đặt chỗ quá hạn
    await cleanupExpiredReservations();

    // 2. Lấy toàn bộ locations
    const locations = await db.location.findMany({
      include: {
        openingHours: true,
        reviews: true,
      },
    });

    const todayStr = getTodayString();
    const currentSlot = getCurrentTimeSlot(mockTimeSlots);

    // 3. Tính toán dynamic available seats cho từng quán
    const locationsWithDynamicSeats = await Promise.all(
      locations.map(async (loc) => {
        if (!currentSlot) {
          // Ngoài giờ hoạt động / Không có slot tương ứng: coi như ghế trống tối đa
          return {
            ...loc,
            availableSeats: loc.totalSeats,
          };
        }

        // Lấy tất cả active reservations cho quán này vào ngày hôm nay ở khung giờ hiện tại
        const activeReservations = await db.reservation.findMany({
          where: {
            locationId: loc.id,
            date: todayStr,
            status: "active",
          },
        });

        // Lọc theo timeSlot.id ở mức javascript do trường timeSlot lưu dưới dạng Json trong prisma
        const activeReservationsInSlot = activeReservations.filter((res) => {
          const slot = res.timeSlot as any;
          return slot && slot.id === currentSlot.id;
        });

        const takenSeats = activeReservationsInSlot.reduce((sum, res) => sum + res.seats, 0);
        const dynamicAvailableSeats = Math.max(0, loc.totalSeats - takenSeats);

        return {
          ...loc,
          availableSeats: dynamicAvailableSeats,
        };
      })
    );

    return NextResponse.json(locationsWithDynamicSeats);
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

