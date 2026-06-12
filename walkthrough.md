# Nhật ký Thay đổi Tính năng (Study Space Finder)

Tài liệu này ghi nhận toàn bộ các thay đổi và tính năng mới đã được triển khai cho dự án **Study Space Finder**.

---

## 1. Khắc phục Lỗi Khởi tạo Prisma
* **Vấn đề:** Ứng dụng gặp lỗi `@prisma/client did not initialize yet` khi gọi các API locations/reservations.
* **Giải pháp:**
  * Khởi tạo Prisma Client thành công bằng lệnh `npx prisma generate`.
  * Đồng bộ cấu trúc Schema với cơ sở dữ liệu Neon PostgreSQL qua `npx prisma db push`.
  * Nạp dữ liệu mẫu ban đầu bằng lệnh `npx tsx prisma/seed.ts`.

---

## 2. Căn chỉnh đều nút "Xem chi tiết" ở Trang chủ
* **Vấn đề:** Các nút bấm "Xem chi tiết" nằm lệch nhau do độ dài của tiêu đề, địa chỉ hoặc số lượng nhãn tiện ích của các địa điểm không đồng đến.
* **Giải pháp:**
  * Điều chỉnh [LocationCard.tsx](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/src/components/home/LocationCard.tsx): Cấu hình thẻ bọc ngoài thành flexbox đứng (`flex flex-col h-full`), đưa phần thân nội dung thành `flex-grow` và gán class `mt-auto` vào nút bấm.
  * Đồng bộ giải pháp cho [LocationGrid.tsx](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/src/components/home/LocationGrid.tsx) (phần `SkeletonCard`) để đảm bảo giao diện luôn đồng đều trong suốt quá trình tải dữ liệu.

---

## 3. Giả lập Dữ liệu Mật độ Sử dụng & Khách đặt chỗ
* **Vấn đề:** Số ghế trống mặc định luôn tối đa và mật độ sử dụng bằng 0% do chưa có nhiều người đặt thật trên hệ thống.
* **Giải pháp:**
  * Viết thuật toán băm (hash) ngẫu nhiên nhưng ổn định `getFakeBookedSeats` và `getFakeBookedPeople` trong [utils.ts](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/src/lib/utils.ts) dựa trên tổ hợp: `locationId`, `slotId` và `dateStr`.
  * Đảm bảo mật độ chiếm chỗ dao động thực tế trong khoảng **35% - 80%** và luôn giữ lại **tối thiểu 3 ghế trống** để phục vụ việc test đặt bàn.
  * **Cơ chế 15 phút:** Bổ sung block thời gian 15 phút vào seed băm. Cứ sau mỗi 15 phút, số lượng người đặt trước hiển thị ở từng khung giờ sẽ thay đổi nhẹ (tăng/giảm 1-2 người) tạo cảm giác hệ thống đang hoạt động thời gian thực.
  * Tích hợp đồng bộ thuật toán tại các API: lấy danh sách quán, chi tiết quán và kiểm tra trạng thái các khung giờ.

---

## 4. Thêm Ghi chú khi Đặt chỗ
* **Yêu cầu:** Người dùng có thể để lại ghi chú cho cửa hàng/không gian khi đặt chỗ.
* **Giải pháp:**
  * **Database:** Thêm trường `note String?` vào model `Reservation` trong [schema.prisma](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/prisma/schema.prisma) và đẩy lên DB.
  * **API:** Cập nhật API POST đặt chỗ để ghi nhận và lưu trữ trường `note` gửi từ frontend.
  * **Frontend (Modal đặt chỗ):** Thêm một ô nhập ghi chú (`textarea`) trong [ReservationModal.tsx](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/src/components/reservation/ReservationModal.tsx).
  * **Frontend (Trang quản lý):** Hiển thị ghi chú dưới dạng một block nhỏ in nghiêng lịch sự bên dưới mốc thời gian của từng đơn đặt trong [ReservationItem.tsx](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/src/components/reservations/ReservationItem.tsx).

---

## 5. Chặn Đặt chỗ Quá khứ & Hiện Giờ Hết hạn Giữ chỗ
* **Yêu cầu:** Không cho phép đặt các khung giờ đã kết thúc trong ngày hôm nay, và hiển thị rõ mốc giờ hết hạn (ví dụ: đặt lúc 17:40 thì 17:55 hết hạn).
* **Giải pháp:**
  * **Chặn giờ quá khứ:** Trong API kiểm tra khả dụng, so sánh giờ kết thúc của slot với giờ hiện tại ở VN. Các khung giờ đã trôi qua sẽ bị chuyển trạng thái khả dụng về `false` và được đánh dấu `isPast = true`. Trên UI, các slot này sẽ bị khóa và hiển thị nhãn **"Đã qua"** thay vì nhãn "Đầy".
  * **Hiện mốc giờ hết hạn:** Bổ sung hàm `formatTime` trong [utils.ts](file:///d:/Learn/Cac_mon_thuc_hanh/study-space-finder/src/lib/utils.ts) để chuyển đổi thời gian hết hạn (`expiresAt`) thành định dạng clock time dạng `HH:mm`.
  * **Cập nhật UI:** Hiển thị mốc giờ hết hạn cụ thể tại màn hình đặt chỗ thành công và trang quản lý đặt chỗ để người dùng biết chính xác thời gian họ cần check-in.

---

## 6. Xác minh và Kiểm thử
* Đã chạy bộ kiểm tra tĩnh `npm run lint` để đảm bảo code sạch, không phát sinh lỗi cú pháp hay thiếu thẻ đóng.
* Các mốc thời gian hoạt động chuẩn xác theo múi giờ Việt Nam (UTC+7).
