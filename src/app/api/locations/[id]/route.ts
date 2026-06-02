import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanupExpiredReservations } from "@/lib/cleanup";
import { getTodayString, getCurrentTimeSlot } from "@/lib/utils";
import { mockTimeSlots } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Tự động dọn dẹp các đặt chỗ quá hạn
    await cleanupExpiredReservations();

    const location = await db.location.findUnique({
      where: { id },
      include: {
        openingHours: true,
        reviews: true,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const todayStr = getTodayString();
    const currentSlot = getCurrentTimeSlot(mockTimeSlots);

    // 2. Tính toán dynamic available seats
    let dynamicAvailableSeats = location.totalSeats;

    if (currentSlot) {
      // Lấy tất cả active reservations cho quán này vào ngày hôm nay ở khung giờ hiện tại
      const activeReservations = await db.reservation.findMany({
        where: {
          locationId: location.id,
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
      dynamicAvailableSeats = Math.max(0, location.totalSeats - takenSeats);
    }

    return NextResponse.json({
      ...location,
      availableSeats: dynamicAvailableSeats,
    });
  } catch (error) {
    console.error("Failed to fetch location detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

