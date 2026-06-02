import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // "cancelled" | "expired"

    if (!status || (status !== "cancelled" && status !== "expired")) {
      return NextResponse.json(
        { error: "Invalid or missing status" },
        { status: 400 }
      );
    }

    // Find reservation to get locationId and seats for refund
    const existing = await db.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // If reservation status is already inactive, don't refund seats again
    const wasActive = existing.status === "active";

    // Update reservation status directly without updating static availableSeats
    const updated = await db.reservation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update reservation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

