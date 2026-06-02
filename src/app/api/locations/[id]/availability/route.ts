import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanupExpiredReservations } from "@/lib/cleanup";
import { mockTimeSlots } from "@/lib/mock-data";

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

    // 2. Lấy location để biết totalSeats
    const location = await db.location.findUnique({
      where: { id },
      select: { totalSeats: true },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // 3. Lấy tất cả active reservations tại địa điểm này vào ngày được chọn
    const activeReservations = await db.reservation.findMany({
      where: {
        locationId: id,
        date: date,
        status: "active",
      },
    });

    // 4. Tính toán chỗ trống cho từng khung giờ
    const dynamicTimeSlots = mockTimeSlots.map((slot) => {
      // Lọc các đơn đặt chỗ thuộc slot này
      const slotReservations = activeReservations.filter((res) => {
        const s = res.timeSlot as any;
        return s && s.id === slot.id;
      });

      // Tính tổng số ghế đã bị chiếm
      const takenSeats = slotReservations.reduce((sum, res) => sum + res.seats, 0);
      const remainingSeats = Math.max(0, location.totalSeats - takenSeats);

      return {
        ...slot,
        // Cập nhật lại số ghế trống thực tế cho slot này
        availableSeats: remainingSeats,
        // Một slot khả dụng nếu còn ít nhất 1 ghế trống
        available: remainingSeats > 0,
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
