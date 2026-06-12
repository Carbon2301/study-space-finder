import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { cleanupExpiredReservations } from "@/lib/cleanup";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Tự động dọn dẹp đặt chỗ quá hạn khi người dùng xem danh sách
    await cleanupExpiredReservations();

    const reservations = await db.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Tự động dọn dẹp đặt chỗ quá hạn trước khi kiểm tra khả dụng
    await cleanupExpiredReservations();

    const body = await request.json();
    const {
      userId,
      locationId,
      locationName,
      locationImage,
      date,
      timeSlot,
      purpose,
      seats,
      status,
      createdAt,
      expiresAt,
      note,
    } = body;

    if (!userId || !locationId || !timeSlot || !seats) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = generateId();

    // 2. Chạy transaction để kiểm tra số ghế động thực tế và tạo đặt chỗ
    const reservation = await db.$transaction(async (tx) => {
      // Lấy thông tin chi tiết quán (để lấy totalSeats)
      const location = await tx.location.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        throw new Error("Location not found");
      }

      // Query tất cả active reservations của địa điểm trong ngày được chọn
      const activeReservations = await tx.reservation.findMany({
        where: {
          locationId,
          date,
          status: "active",
        },
      });

      // Lọc các đơn đặt chỗ thuộc slot này
      const activeInSlot = activeReservations.filter((res) => {
        const slot = res.timeSlot as any;
        return slot && slot.id === timeSlot.id;
      });

      const takenSeats = activeInSlot.reduce((sum, res) => sum + res.seats, 0);
      const remainingSeats = location.totalSeats - takenSeats;

      if (remainingSeats < seats) {
        throw new Error("Not enough seats available for this time slot");
      }

      // Đủ ghế trống -> Tạo đơn đặt chỗ mới (Không trừ vào location.availableSeats tĩnh)
      return tx.reservation.create({
        data: {
          id,
          userId,
          locationId,
          locationName,
          locationImage,
          date,
          timeSlot,
          purpose,
          seats,
          status,
          createdAt,
          expiresAt,
          note: note || "",
        },
      });
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error("Failed to create reservation:", error);
    const errorMessage = error.message || "Internal Server Error";
    const statusCode = error.message === "Location not found" ? 404 : 
                       error.message === "Not enough seats available for this time slot" ? 400 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

