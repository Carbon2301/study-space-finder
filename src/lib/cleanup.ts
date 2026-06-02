import { db } from "./db";

export async function cleanupExpiredReservations() {
  try {
    const now = new Date().toISOString();
    
    // Tìm và cập nhật tất cả đơn đặt chỗ 'active' đã quá thời gian giữ chỗ
    const expiredCount = await db.reservation.updateMany({
      where: {
        status: "active",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "expired",
      },
    });

    if (expiredCount.count > 0) {
      console.log(`[Auto-Cleanup] Đã tự động hủy ${expiredCount.count} đặt chỗ quá hạn.`);
    }
  } catch (error) {
    console.error("[Auto-Cleanup] Lỗi dọn dẹp đặt chỗ quá hạn:", error);
  }
}
